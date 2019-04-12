import { parseInt, times } from 'lodash';
import constants from '../common/constants';
import { Reader, ReaderResult, UpdateGolfer, TourneyConfigSpec } from './Types';

const {MISSED_CUT, NHOLES, NDAYS} = constants;

interface LbDataGolfer {
  currentHoleId: string; // "<number>" || null
  isActive: boolean;
  playerNames: {
    firstName: string;
    lastName: string;
    playerNameAddOns: string;
  },
  playerRoundId: string; // "<number>"
  round: string; // round score :: "<number>" || "--"
  rounds: [{
    strokes: string; // "<number>" || "--"
  }],
  strokes: string; // "<number>" || "--"
  status: "active" | "cut" | "wd";
  thru: string; // "<number>" || "--"
  total: string; // "<number>" || "--"
  roundComplete: boolean; // ONLY VALID FOR ACTIVE GOLFERS
  tournamentRoundId: string; // "<number>"
}

function isNullStr(str: string) {
  return str.startsWith('--');
}

function safeParseInt(str: string): number | null {
  return isNullStr(str) ? null : parseInt(str);
}

function parseRequiredInt(str: string, msg: string): number {
  if (str === null) throw new Error(`${msg}: ${str}`);

  const n = safeParseInt(str);
  if (n === null) throw new Error(`${msg}: ${str}`);
  
  return n;
}

function parseRoundScore(g: LbDataGolfer): number {
  const str = g.round;
  if (isNullStr(str)) return 0;
  if (str === 'E') return 0;
  if (str.startsWith('+')) return parseInt(str.substr(1));
  if (str.startsWith('-')) return parseInt(str);
  throw new Error(`Unexpected round score: ${str}`);
}

function parseRoundDay(g: LbDataGolfer) {
  const golferRoundId = parseRequiredInt(g.playerRoundId, 'Invalid player round id');
  return golferRoundId;
}

function parseThru(g: LbDataGolfer) {
  const thruStr = g.thru.replace('*', '');
  if (isNullStr(thruStr)) return null;
  if (thruStr === 'F') return NHOLES;
  return parseRequiredInt(thruStr, `Invalid thru value: ${thruStr}`);
}

function parseMissedCutGolferScores(par: number, g: LbDataGolfer): (number | string)[] {
    // This logic for "finished round" is only valid for missed cut golfers
  const finishedRound = g.currentHoleId === null;

  let latestRound = parseRoundDay(g);
  if (!finishedRound) {
    latestRound--;
  }
  return g.rounds.map((r, i) => i < latestRound ? safeParseInt(r.strokes) - par : MISSED_CUT);
}

function parseGolferScores(par: number, g: LbDataGolfer): (number | string)[] {
  const missedCut = !g.isActive;
  if (missedCut) return parseMissedCutGolferScores(par, g);

  const currentRound = parseRoundDay(g);
  const currentRoundScore = parseRoundScore(g);

  // Logic for getting the current round score is different than earlier rounds
  const scores = g.rounds
      .slice(0, currentRound - 1)
      .map(r => safeParseInt(r.strokes) - par);
  scores.push(currentRoundScore);
  for (let i=scores.length; i<NDAYS; i++) {
    scores.push(0);
  }
  
  return scores;
}

function parseGolfer(par: number, g: LbDataGolfer): UpdateGolfer {
  const fullName = `${g.playerNames.firstName} ${g.playerNames.lastName}`;
  const day = parseRoundDay(g);
  const thru = parseThru(g);
  const scores = parseGolferScores(par, g);
  return {
    golfer: fullName,
    scores,
    day,
    thru,
  };
}

class PgaTourLbDataReader implements Reader {
  async run(config: TourneyConfigSpec, data: any): Promise<ReaderResult> {
    const json = JSON.parse(data);

    const par = config.par;
    const golfers = json.rows.map((g: LbDataGolfer) => parseGolfer(par, g));
    return { par, golfers };
  }
}

export default new PgaTourLbDataReader();