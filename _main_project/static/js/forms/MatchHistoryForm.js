import AbstractModalView from "./AbstractModalView.js";
import { user } from "../index.js";
import { getUserMatchHistory } from "../user/UserAPI.js";

export default class extends AbstractModalView {
  constructor(modal) {
    super(modal);
    this.setTitle("Match History Form");
  }

  async createDomElements(data=null) {
    // Create the container
    const container = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Match History';
    title.classList.add('modal-title');
    container.appendChild(title);

    const matchData = await getUserMatchHistory(data);
    console.log(matchData);

    if (matchData.match_history.length === 0) {
      const noMatches = document.createElement('p');
      noMatches.textContent = 'No matches to show';
      container.appendChild(noMatches);
    } else {
      console.log('There are matches to show');

      const matchHistory = document.createElement('div');
      matchHistory.classList.add('match-history');
      container.appendChild(matchHistory);

      for (const match of matchData.match_history) {
        if (match.winner !== null) {
          console.log("found a match: ", match);

          const matchItem = document.createElement('div');
          matchItem.classList.add('match-result');

          // Game ID
          const matchGameID = document.createElement('p');
          matchGameID.classList.add('match-game-id');
          matchGameID.textContent = `Game ID: ${match.game_id}`;
          matchItem.appendChild(matchGameID);

          // Date
          const matchDate = document.createElement('p');
          matchDate.classList.add('match-date');
          matchDate.textContent = `Date: ${match.date.substring(0, 10)}`;
          matchItem.appendChild(matchDate);

          // Scores
          const scoresTitle = document.createElement('p');
          scoresTitle.classList.add('match-scores-title');
          scoresTitle.textContent = 'Scores:';
          matchItem.appendChild(scoresTitle);

          const scoresDiv = document.createElement('div');
          scoresDiv.classList.add('match-scores');

          const player1Score = document.createElement('p');
          player1Score.classList.add('match-score');
          player1Score.textContent = `${match.players.player1}: ${match.scores.score1}`;
          scoresDiv.appendChild(player1Score);

          const player2Score = document.createElement('p');
          player2Score.classList.add('match-score');
          player2Score.textContent = `${match.players.player2}: ${match.scores.score2}`;
          scoresDiv.appendChild(player2Score);

          if (match.players.player3 !== null) {
            const player3Score = document.createElement('p');
            player3Score.classList.add('match-score');
            player3Score.textContent = `${match.players.player3}: ${match.scores.score3}`;
            scoresDiv.appendChild(player3Score);
          }

          if (match.players.player4 !== null) {
            const player4Score = document.createElement('p');
            player4Score.classList.add('match-score');
            player4Score.textContent = `${match.players.player4}: ${match.scores.score4}`;
            scoresDiv.appendChild(player4Score);
          }

          matchItem.appendChild(scoresDiv);

          // Winner
          const matchWinner = document.createElement('p');
          matchWinner.classList.add('match-winner');
          matchWinner.textContent = `Winner: ${match.winner}`;
          matchItem.appendChild(matchWinner);

          matchHistory.appendChild(matchItem);
        }
      }
      container.appendChild(matchHistory);
    }
    return container;
  }
}