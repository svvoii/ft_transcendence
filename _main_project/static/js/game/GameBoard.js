export default class GameBoard {
  constructor(appId) {
    this.app = document.querySelector(`#${appId}`);
    this.gameboard = document.createElement('div');
  }

  full_render() {
    this.gameboard.id = "gameModal";
    this.gameboard.classList.add('modal-game');
    this.gameboard.classList.add('old-crt-monitor');
    this.gameboard.appendChild(this.getDomElements());

    this.app.appendChild(this.gameboard);
    this.afterRender();
  }

  fast_render() {
    this.app.appendChild(this.gameboard);
  }

  getDomElements() {
    // Create the main container div
    const container = document.createElement('div');
    container.classList.add('board');

    // Create the ball div
    const ball = document.createElement('div');
    ball.classList.add('ball');

    // Create the ball effect div and append it to the ball div
    const ballEffect = document.createElement('div');
    ballEffect.classList.add('ball_effect');
    ball.appendChild(ballEffect);

    // Create the paddle_1 div
    const paddle1 = document.createElement('div');
    paddle1.classList.add('paddle_1', 'paddle');

    // Create the paddle_2 div
    const paddle2 = document.createElement('div');
    paddle2.classList.add('paddle_2', 'paddle');

    // Create the game message h2 element
    const gameMessage = document.createElement('h2');
    gameMessage.classList.add('game-message');
    gameMessage.textContent = 'Press ENTER to play PONG';

    // Append all elements to the container
    container.appendChild(ball);
    container.appendChild(paddle1);
    container.appendChild(paddle2);
    container.appendChild(gameMessage);

    return container;
  }
  
  async afterRender() {

    let gameState = 'start';
    let paddle_1 = document.querySelector('.paddle_1');
    let paddle_2 = document.querySelector('.paddle_2');
    let board = document.querySelector('.board');
    // let initial_ball = document.querySelector('.ball');
    // let ball = document.querySelector('.ball');
    // let score_1 = document.querySelector('.player_1_score');
    // let score_2 = document.querySelector('.player_2_score');
    let message = document.querySelector('.game-message');
    let paddle_1_coord = paddle_1.getBoundingClientRect();
    let paddle_2_coord = paddle_2.getBoundingClientRect();
    // let initial_ball_coord = ball.getBoundingClientRect();
    // let ball_coord = initial_ball_coord;
    let board_coord = board.getBoundingClientRect();
    // let paddle_common =
    //     document.querySelector('.paddle').getBoundingClientRect();
    
    let dx = Math.floor(Math.random() * 4) + 3;
    let dy = Math.floor(Math.random() * 4) + 3;
    let dxd = Math.floor(Math.random() * 2);
    let dyd = Math.floor(Math.random() * 2);


    document.addEventListener('keydown', (e) => {
      if (e.key == 'Enter') {
          gameState = gameState == 'start' ? 'play' : 'start';
          if (gameState == 'play') {
          message.innerHTML = 'Game Started';
          message.style.left = 42 + 'vw';
          // renderGameElements();
          requestAnimationFrame(() => {
              dx = Math.floor(Math.random() * 4) + 3;
              dy = Math.floor(Math.random() * 4) + 3;
              dxd = Math.floor(Math.random() * 2);
              dyd = Math.floor(Math.random() * 2);
              // moveBall(dx, dy, dxd, dyd);
          });
          }
        }
        
        if (gameState == 'play') {
    
            if (e.key == 'w') {
              paddle_1.style.top =
              Math.max(
              board_coord.top,
              paddle_1_coord.top - 10
              ) + 'px';
            // paddle_1.style.top =
            //     Math.max(
            //     board_coord.top,
            //     paddle_1_coord.top - 10
            //     ) + 'px';
            paddle_1_coord = paddle_1.getBoundingClientRect();
            }
            if (e.key == 's') {
              paddle_1.style.top =
                  Math.max(
                  board_coord.top,
                  paddle_1_coord.top + 10
                  ) + 'px';
              paddle_1_coord = paddle_1.getBoundingClientRect();
              }
    
            if (e.key == 'ArrowUp') {
            paddle_2.style.top =
                Math.max(
                board_coord.top,
                paddle_2_coord.top - 10
                ) + 'px';
            paddle_2_coord = paddle_2.getBoundingClientRect();
            }
            if (e.key == 'ArrowDown') {
              paddle_2.style.top =
                  Math.max(
                  board_coord.top,
                  paddle_2_coord.top + 10
                  ) + 'px';
              paddle_2_coord = paddle_2.getBoundingClientRect();
              }
        }
    });

    // function renderGameElements() {
    //   const board = document.querySelector('.board');
    //   board.innerHTML = `
    //     <div class='ball'>
    //       <div class="ball_effect"></div>
    //     </div>
    //     <div class="paddle_1 paddle"></div>
    //     <div class="paddle_2 paddle"></div>

    //   `;
    // }



  }
};


// document.addEventListener('keydown', (e) => {
// if (e.key == 'Enter') {
//     gameState = gameState == 'start' ? 'play' : 'start';
//     if (gameState == 'play') {
//     message.innerHTML = 'Game Started';
//     message.style.left = 42 + 'vw';
//     requestAnimationFrame(() => {
//         dx = Math.floor(Math.random() * 4) + 3;
//         dy = Math.floor(Math.random() * 4) + 3;
//         dxd = Math.floor(Math.random() * 2);
//         dyd = Math.floor(Math.random() * 2);
//         moveBall(dx, dy, dxd, dyd);
//     });
//     }
// }

// if (gameState == 'play') {
//     if (e.key == 'w') {
//     paddle_1.style.top =
//         Math.max(
//         board_coord.top,
//         paddle_1_coord.top - window.innerHeight * 0.06
//         ) + 'px';
//     paddle_1_coord = paddle_1.getBoundingClientRect();
//     }
//     if (e.key == 's') {
//     paddle_1.style.top =
//         Math.min(
//         board_coord.bottom - paddle_common.height,
//         paddle_1_coord.top + window.innerHeight * 0.06
//         ) + 'px';
//     paddle_1_coord = paddle_1.getBoundingClientRect();
//     }

//     if (e.key == 'ArrowUp') {
//     paddle_2.style.top =
//         Math.max(
//         board_coord.top,
//         paddle_2_coord.top - window.innerHeight * 0.1
//         ) + 'px';
//     paddle_2_coord = paddle_2.getBoundingClientRect();
//     }
//     if (e.key == 'ArrowDown') {
//     paddle_2.style.top =
//         Math.min(
//         board_coord.bottom - paddle_common.height,
//         paddle_2_coord.top + window.innerHeight * 0.1
//         ) + 'px';
//     paddle_2_coord = paddle_2.getBoundingClientRect();
//     }
// }
// });



// function moveBall(dx, dy, dxd, dyd) {
// if (ball_coord.top <= board_coord.top) {
//     dyd = 1;
// }
// if (ball_coord.bottom >= board_coord.bottom) {
//     dyd = 0;
// }
// if (
//     ball_coord.left <= paddle_1_coord.right &&
//     ball_coord.top >= paddle_1_coord.top &&
//     ball_coord.bottom <= paddle_1_coord.bottom
// ) {
//     dxd = 1;
//     dx = Math.floor(Math.random() * 4) + 3;
//     dy = Math.floor(Math.random() * 4) + 3;
// }
// if (
//     ball_coord.right >= paddle_2_coord.left &&
//     ball_coord.top >= paddle_2_coord.top &&
//     ball_coord.bottom <= paddle_2_coord.bottom
// ) {
//     dxd = 0;
//     dx = Math.floor(Math.random() * 4) + 3;
//     dy = Math.floor(Math.random() * 4) + 3;
// }
// if (
//     ball_coord.left <= board_coord.left ||
//     ball_coord.right >= board_coord.right
// ) {
//     if (ball_coord.left <= board_coord.left) {
//     score_2.innerHTML = +score_2.innerHTML + 1;
//     } else {
//     score_1.innerHTML = +score_1.innerHTML + 1;
//     }
//     gameState = 'start';

//     ball_coord = initial_ball_coord;
//     ball.style = initial_ball.style;
//     message.innerHTML = 'Press Enter to Play Pong';
//     message.style.left = 38 + 'vw';
//     return;
// }
// ball.style.top = ball_coord.top + dy * (dyd == 0 ? -1 : 1) + 'px';
// ball.style.left = ball_coord.left + dx * (dxd == 0 ? -1 : 1) + 'px';
// ball_coord = ball.getBoundingClientRect();
// requestAnimationFrame(() => {
//     moveBall(dx, dy, dxd, dyd);
// });
// }