'use strict';

var _ = require('lodash');
var DraftStore = require('../stores/DraftStore');
var GolfDraftPanel = require('./GolfDraftPanel.jsx');
var GolferLogic = require('../logic/GolferLogic');
var GolferStore = require('../stores/GolferStore');
var PlayerStore = require('../stores/PlayerStore');
var React = require('react');
var ReactCSSTransitionGroup = require('react/lib/ReactCSSTransitionGroup');

var DraftHistory = React.createClass({

  getInitialState: function () {
    return {
      selectedPlayerId: null
    };
  },

  render: function () {
    var draftPicks = _.clone(this.props.draftPicks).reverse();
    var selectedPlayerId = this.state.selectedPlayerId;
    var onPersonClick = this._onPersonClick;
    var heading = 'Draft History';

    if (selectedPlayerId) {
      draftPicks = _.where(draftPicks, { player: selectedPlayerId });
      heading = (
        <span>
          <a href='#' onClick={this._onDeselectPerson}>Draft History</a>
          <span> - </span>{PlayerStore.getPlayer(selectedPlayerId).name}
        </span>
      );
    }

    return (
      <GolfDraftPanel heading={heading}>
        <table className='table'>
          <thead><tr><th>#</th><th>Pool Player</th><th>Golfer</th></tr></thead>
          <tbody>
            {_.map(draftPicks, function (p) {
              var playerName = PlayerStore.getPlayer(p.player).name;
              return (
                <tr key={p.pickNumber}>
                  <td>{p.pickNumber + 1}</td>
                  <td>
                    {selectedPlayerId ? playerName : (
                      <a href='#' onClick={_.partial(onPersonClick, p.player)}>
                        {playerName}
                      </a>
                    )}
                  </td>
                  <td>{GolferLogic.renderGolfer(GolferStore.getGolfer(p.golfer))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GolfDraftPanel>
    );
  },

  _onPersonClick: function (pid, ev) {
    ev.preventDefault();
    this.setState({ selectedPlayerId: pid });
  },

  _onDeselectPerson: function (ev) {
    ev.preventDefault();
    this.setState({ selectedPlayerId: null });
  }

});

module.exports = DraftHistory;
