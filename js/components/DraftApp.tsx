import * as _ from 'lodash';
import * as React from 'react';
import AppPausedStatus from './AppPausedStatus';
import Assets from '../constants/Assets';
import ChatRoom from './ChatRoom';
import DraftChooser from './DraftChooser';
import DraftClock from './DraftClock';
import DraftHistory from './DraftHistory';
import DraftPickOrderView from './DraftPickOrderView';
import DraftStatus from './DraftStatus';
import GolfDraftPanel from './GolfDraftPanel';
import PickListEditor from './PickListEditor';
import {Link} from 'react-router';
import {
  ChatMessage,
  DraftPick,
  DraftPickOrder,
  Golfer,
  Indexed,
  IndexedGolfers,
  User,
} from '../types/ClientTypes';

const myTurnSound = new Audio(Assets.MY_TURN_SOUND);
const pickMadeSound = new Audio(Assets.PICK_MADE_SOUND);

export interface DraftAppProps {
  draftPicks: DraftPick[];
  isMyDraftPick: boolean;
  golfersRemaining: IndexedGolfers;
  syncedPickList: string[];
  pendingPickList: string[];
  currentUser: User;
  chatMessages: ChatMessage[];
  activeUsers: Indexed<number>;
  currentPick?: DraftPickOrder;
  pickingForUsers: string[];
  autoPickUsers: Indexed<string>;
  allowClock: boolean;
  draftHasStarted: boolean;
  isPaused: boolean;
}

export interface DraftAppState {
  draftHistoryUserId?: string;
}

export default class DraftApp extends React.Component<DraftAppProps, DraftAppState> {

  constructor(props) {
    super(props);
    this.state = { draftHistoryUserId: null };
  }

  componentWillReceiveProps(nextProps: DraftAppProps) {
    const props = this.props;
    if (!props.isMyDraftPick && nextProps.isMyDraftPick) {
      myTurnSound.play();
    } else if (props.draftPicks.length + 1 === nextProps.draftPicks.length) {
      pickMadeSound.play();
    }
  }

  _renderPickListHeader() {
    return (
      <span>
        <span>Pick List Editor</span>
        <span className='pull-right'><em>NEW!</em></span>
      </span>
    );
  }

  _renderPreDraft() {
    return (
      <section>

        <div className='row'>
          <div className='col-md-12'>
            <div className='jumbotron'>
              <h1>Draft not started.</h1>
              <em>New feature: <a href='#InlinePickListEditor'>Set up your pick list beforehand</a></em>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <a id='InlinePickListEditor' />
            <GolfDraftPanel heading={this._renderPickListHeader()}>
              <PickListEditor
                preDraftMode
                golfersRemaining={this.props.golfersRemaining}
                syncedPickList={this.props.syncedPickList}
                pendingPickList={this.props.pendingPickList}
                height='30em'
              />
            </GolfDraftPanel>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <ChatRoom
              currentUser={this.props.currentUser}
              messages={this.props.chatMessages}
              activeUsers={this.props.activeUsers}
            />
          </div>
        </div>

      </section>
    );
  }

  _renderDraftComplete() {
    return (
      <section>

        <div className="row">
          <div className='col-md-12'>
            <div className='jumbotron'>
              <h1>The draft is over!</h1>
              <p><Link to='/'>Check out the live leaderboard</Link></p>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <ChatRoom
              currentUser={this.props.currentUser}
              messages={this.props.chatMessages}
              activeUsers={this.props.activeUsers}
            />
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <DraftHistory
              draftPicks={this.props.draftPicks}
              selectedUserId={this.state.draftHistoryUserId}
              onSelectionChange={this._onDraftHistorySelectionChange}
            />
          </div>
        </div>

      </section>
    );
  }

  render() {
    if (!this.props.draftHasStarted) {
      return this._renderPreDraft();
    }

    const isDraftComplete = !this.props.currentPick;
    if (isDraftComplete) {
      return this._renderDraftComplete();
    }

    const isMyPick = this.props.isMyDraftPick;
    const isDraftPaused = this.props.isPaused;

    return (
      <div>
        {isDraftPaused ? (<AppPausedStatus />) : (
          <div className='row'>

            <div className='col-md-9'>
              {!isMyPick ? (
                <GolfDraftPanel heading='Draft Status'>
                  <DraftStatus currentPick={this.props.currentPick} />
                </GolfDraftPanel>
              ) : (
                <DraftChooser
                  currentUser={this.props.currentUser}
                  golfersRemaining={this.props.golfersRemaining}
                  currentPick={this.props.currentPick}
                  syncedPickList={this.props.syncedPickList}
                />
              )}
            </div>

            <div className='col-md-3'>
              <DraftClock
                draftPicks={this.props.draftPicks}
                isMyPick={this.props.isMyDraftPick}
                allowClock={this.props.allowClock}
              />
            </div>
          </div>
        )}

        <div className='row'>

          <div className='col-md-4'>
            <GolfDraftPanel heading='Draft Order'>
              <a id='InlineDraftPickListEditor' />
              <DraftPickOrderView
                currentUser={this.props.currentUser}
                currentPick={this.props.currentPick}
                pickingForUsers={this.props.pickingForUsers}
                autoPickUsers={this.props.autoPickUsers}
                onUserSelected={this._onDraftHistorySelectionChange}
              />
            </GolfDraftPanel>
          </div>

          <div className='col-md-8'>
            <GolfDraftPanel heading={this._renderPickListHeader()}>
              <PickListEditor
                golfersRemaining={this.props.golfersRemaining}
                syncedPickList={this.props.syncedPickList}
                pendingPickList={this.props.pendingPickList}
                height='29em'
              />
            </GolfDraftPanel>
          </div>

        </div>

        <div className='row'>
          <div className='col-md-12'>
            <ChatRoom
              currentUser={this.props.currentUser}
              messages={this.props.chatMessages}
              activeUsers={this.props.activeUsers}
            />
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <DraftHistory
              draftPicks={this.props.draftPicks}
              selectedUserId={this.state.draftHistoryUserId}
              onSelectionChange={this._onDraftHistorySelectionChange}
            />
          </div>
        </div>

      </div>
    );
  }

  _onDraftHistorySelectionChange = (userId: string) => {
    this.setState({ draftHistoryUserId: userId });
  }

};
