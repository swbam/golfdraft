'use strict';

const _ = require('lodash');
const DraftActions = require('../actions/DraftActions');
const Link = require('react-router').Link;
const PlayerStore = require('../stores/PlayerStore');
const React = require('react');

const DraftOver = React.createClass({

  render: function () {
    return (
      <div className="jumbotron">
        <h1>The draft is over!</h1>
        <p><Link to='/'>Check out the live leaderboard</Link></p>
      </div>
    );
  }

});

const DraftStatus = React.createClass({

  render: function () {
    const currentPick = this.props.currentPick;
    if (!currentPick) {
      return (<DraftOver />);
    }

    const playerName = PlayerStore.getPlayer(currentPick.player).name;
    return (
      <div>
        <p className='draft-status'>
          Now drafting (Pick #{currentPick.pickNumber + 1}): <b>{playerName}</b>
        </p>
        <a href='#' onClick={this._onTakePick}>I'll pick for {playerName}</a>
      </div>
    );
  },

  _onTakePick: function (ev) {
    ev.preventDefault();
    DraftActions.draftForPlayer(this.props.currentPick.player);
  }

});

module.exports = DraftStatus;
