import * as $ from 'jquery';
import * as _ from 'lodash';
import * as React from 'react';
import DraftActions from '../actions/DraftActions';
import DraftHistory from './DraftHistory';
import DraftStatus from './DraftStatus';
import DraftStore from '../stores/DraftStore';
import UserActions from '../actions/UserActions';
import {IndexedUsers, Indexed, DraftPick, DraftPickOrder} from '../types/Types';

function togglePause(isPaused: boolean) {
  $.ajax({
    url: '/admin/pause',
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ isPaused: isPaused })
  });
}

function toggleAllowClock(allowClock: boolean) {
  $.ajax({
    url: '/admin/allowClock',
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ allowClock: allowClock })
  });
}

function toggleDraftHasStarted(draftHasStarted: boolean) {
  $.ajax({
    url: '/admin/draftHasStarted',
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ draftHasStarted: draftHasStarted })
  });
}

function toggleAutoPick(userId: string, autoPick: boolean) {
  $.ajax({
    url: '/admin/autoPickUsers',
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ userId: userId, autoPick: autoPick })
  });
}

interface PasswordInputProps {
}

interface PasswordInputState {
  password: string;
  busy: boolean;
}

class PasswordInput extends React.Component<PasswordInputProps, PasswordInputState> {

  constructor(props) {
    super(props);
    this.state = {
      password: '',
      busy: false
    };
  }

  render() {
    return (
      <section>
        <form onSubmit={this._onSubmit}>
          <div className='form-group'>
            <label htmlFor='adminPassword'>Password</label>
            <input
              type='password'
              className='form-control'
              id='adminPassword'
              name='password'
              onChange={this._onChange}
              value={this.state.password}
              disabled={this.state.busy}
            />
          </div>
          <button
            type='submit'
            className='btn btn-default'
            disabled={this.state.busy}
          >Submit</button>
        </form>
      </section>
    );
  }

  _onChange = (ev) => {
    this.setState({ password: ev.target.value });
  }

  _onSubmit = (ev) => {
    ev.preventDefault();

    const that = this;
    this.setState({ busy: true });
    $.ajax({
      url: '/admin/login',
      type: 'POST',
      data: { password: this.state.password },
      success() {
        UserActions.setIsAdmin(true);
      },
      error() {
        that.setState({ busy: false });
      }
    });
  }

};

export interface AdminAppProps {
  isAdmin: boolean;
  draftHasStarted: boolean;
  isPaused: boolean;
  users: IndexedUsers;
  autoPickUsers: Indexed<string>;
  allowClock: boolean;
  currentPick: DraftPickOrder;
  draftPicks: DraftPick[];
}

export interface AdminAppState{
  confirmingUndo: boolean;
}

class AdminApp extends React.Component<AdminAppProps, AdminAppState> {

  constructor(props) {
    super(props);
    this.state = { confirmingUndo: false };
  }

  render() {
    const props = this.props;
    const confirmingUndo = this.state.confirmingUndo;

    if (!props.isAdmin) {
      return (<PasswordInput />);
    }

    return (
      <section>
        <h1>Hello admin!</h1>

        {props.draftHasStarted ? (
          <h2>Draft has started!</h2>
        ) : (
          <h2>Draft has not started yet</h2>
        )}
        <div className='panel'>
          <div className='panel-body'>
            <button
              type='button'
              className='btn btn-default'
              onClick={this._onStartDraft}
            >Start Draft</button>
            <span> </span>
            <button
              type='button'
              className='btn btn-default'
              onClick={this._onUnstartDraft}
            >Unstart Draft</button>
          </div>
        </div>

        {props.isPaused ? (
          <h2>Paused!</h2>
        ) : (
          <h2>Not Paused</h2>
        )}
        <div className='panel'>
          <div className='panel-body'>
            <button
              type='button'
              className='btn btn-default'
              onClick={this._onPause}
            >Pause</button>
            <span> </span>
            <button
              type='button'
              className='btn btn-default'
              onClick={this._onUnpause}
            >Unpause</button>
          </div>
        </div>

        <h2>Auto picks</h2>
        <div className='panel'>
          <div className='panel-body'>
            <ul className='list-unstyled'>
              {_.map(props.users, (user) => {
                const checked = !!props.autoPickUsers[user._id];
                return (
                  <li key={user._id}>
                    <div className='checkbox'>
                      <label>
                        <input
                          type='checkbox'
                          checked={checked}
                          onChange={toggleAutoPick.bind(null, user._id, !checked)}
                        /> {user.name}
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {props.allowClock ? (
          <h2>Allowing clock</h2>
        ) : (
          <h2>Not allowing clock!</h2>
        )}
        <div className='panel'>
          <div className='panel-body'>
            <button
              type='button'
              className='btn btn-default'
              onClick={this._onAllowClock}
            >Allow clock</button>
            <span> </span>
            <button
              type='button'
              className='btn btn-default'
              onClick={this._onStopClock}
            >Pause clock</button>
          </div>
        </div>

        <div className='panel'>
          <div className='panel-body'>
            {confirmingUndo ? null : (
              <button
                className='btn btn-default'
                  type='button'
                onClick={this._onUndoLastPick}
              >Undo Pick</button>
            )}
            {!confirmingUndo ? null : (
              <span>
                <label>Are you sure you want to undo the last pick?</label>
                <button
                  className='btn btn-default'
                  type='button'
                  onClick={this._onConfirmUndoLastPick}
                >I'm sure</button>
                <span> </span>
                <button
                  className='btn btn-default'
                  type='button'
                  onClick={this._onCancelUndoLastPick}
                >Cancel</button>
              </span>
            )}
          </div>
        </div>

        <div className='panel'>
          <div className='panel-body'>
            <button className='btn btn-default' onClick={this._forceRefresh}>Force Refresh</button>
          </div>
        </div>

        {!props.currentPick ? null : (
          <DraftStatus currentPick={props.currentPick} />
        )}
        <DraftHistory draftPicks={props.draftPicks} />
      </section>
    );
  }

  _onStartDraft = () => {
    toggleDraftHasStarted(true);
  }

  _onUnstartDraft = () => {
    toggleDraftHasStarted(false);
  }

  _onPause = () => {
    togglePause(true);
  }

  _onUnpause = () => {
    togglePause(false);
  }

  _onAllowClock = () => {
    toggleAllowClock(true);
  }

  _onStopClock = () => {
    toggleAllowClock(false);
  }

  _onUndoLastPick = () => {
    this.setState({ confirmingUndo: true });
  }

  _onConfirmUndoLastPick = () => {
    $.ajax({
      url: '/admin/lastPick',
      type: 'DELETE',
      contentType: 'application/json'
    });
    this._onCancelUndoLastPick();
  }

  _onCancelUndoLastPick = () => {
    this.setState({ confirmingUndo: false });
  }

  _forceRefresh() {
    $.ajax({
      url: '/admin/forceRefresh',
      type: 'PUT'
    });
  }

};

export default AdminApp;