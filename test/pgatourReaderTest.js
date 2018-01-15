require('./initTestConfig');

const constants = require('../common/constants');
const reader = require('../scores_sync/pgatourReader');
const should = require('should');

const MISSED_CUT = constants.MISSED_CUT;

describe('PgaTourReader', function () {
  describe('parseGolfer', function () {

    it('parses for missed cut', function () {
      reader
        .parseGolfer(70, 3, require('./files/golfer_missedcut'))
        .should.eql({
          golfer: 'Hunter Mahan',
          scores: [3, 4, MISSED_CUT, MISSED_CUT],
          thru: null,
          day: 3
        });
    });

    it('parses for active mid-tourney user', function () {
      reader
        .parseGolfer(70, 3, require('./files/golfer_midtourney_active'))
        .should.eql({
          golfer: 'Henrik Stenson',
          scores: [-5, 4, 0, 0],
          thru: 18,
          day: 2
        });
    });

    it('parses for active mid-tourney mid-day user', function () {
      reader
        .parseGolfer(70, 3, require('./files/golfer_midtourney_playing'))
        .should.eql({
          golfer: 'Henrik Stenson',
          scores: [-5, 4, -2, 0],
          thru: 7,
          day: 3
        });
    });

    it('parses for mid-day wd', function () {
      reader
        .parseGolfer(72, 3, require('./files/golfer_midround_wd'))
        .should.eql({
          golfer: 'Jamie Donaldson',
          scores: [7, MISSED_CUT, MISSED_CUT, MISSED_CUT],
          thru: null,
          day: 3
        });
    });

  });
});
