import { fetchGameState, movePaddle, endGame } from './GameAPI.js';

// This will initialize the game logic
// It will draw the paddles and ball on the canvas
// The ball position is updated via WebSocket
// The paddle position is updated via API call on key press
export async function initializeGame(socket, role, game_id) {

	console.log('..initializeGame, game_id: ', game_id);

    socket.onopen = function() {
        console.log('WebSocket connection established');
		socket.send(JSON.stringify({ type: 'get_initial_state' }));
    };

    socket.onclose = function() {
        console.log('WebSocket connection closed');
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    const paddleHeight = 60;
    const paddleWidth = 10;
    const ballSize = 8;
    let ballX;
    let ballY;
    let paddle1;
    let paddle2;
	let paddle3;
	let paddle4;
	let score1;
	let score2;
	let score3;
	let score4;
	let winner = null;
	let mode;
	let numPlayers;

    // Fetch initial game state
    // let gameState = await fetchGameState(game_id);
	// updateGameState(gameState);

	function updateGameState(gameState) {
		mode = gameState.game_mode;
		numPlayers = gameState.num_players;
		paddle1 = gameState.paddle1;
		paddle2 = gameState.paddle2;
		paddle3 = gameState.paddle3;
		paddle4 = gameState.paddle4;
		score1 = gameState.score1;
		score2 = gameState.score2;
		score3 = gameState.score3;
		score4 = gameState.score4;
		// console.log('..score1: ', score1, ' score2: ', score2);
	}

    socket.onmessage = function(event) {
		// console.log('WebSocket message received: ', event.data.type);
		const data = JSON.parse(event.data);
		// console.log('..onmessage, data.type: ', data.type);
		if (data.type === 'initial_state') {
			const gameState = data.state;
			updateGameState(gameState);
		} else if (data.type === 'update_state') {
			ballX = data.ball_x;
			ballY = data.ball_y;
			score1 = data.score1;
			score2 = data.score2;
			score3 = data.score3;
			score4 = data.score4;
			paddle1 = data.paddle1;
			paddle2 = data.paddle2;
			paddle3 = data.paddle3;
			paddle4 = data.paddle4;
			// winner = data.winner;
		} else if (data.type === 'game_over') {
			winner = data.winner;
			// alert(`Game Over! ${winner} wins!`);
		}
    };

    function drawPaddle1() {
        ctx.fillStyle = 'white';
		const y = Math.min(Math.max(paddle1, 0), canvas.height - paddleHeight);
		ctx.fillRect(0, y, paddleWidth, paddleHeight);
    }

    function drawPaddle2() {
        ctx.fillStyle = 'white';
		const y = Math.min(Math.max(paddle2, 0), canvas.height - paddleHeight);
		ctx.fillRect(canvas.width - paddleWidth, y, paddleWidth, paddleHeight);
    }

	function drawPaddle3() {
		ctx.fillStyle = 'white';
		const x = Math.min(Math.max(paddle3, 0), canvas.width - paddleHeight);
		ctx.fillRect(x, 0, paddleHeight, paddleWidth);
	}

	function drawPaddle4() {
		ctx.fillStyle = 'white';
		const x = Math.min(Math.max(paddle4, 0), canvas.width - paddleHeight);
		ctx.fillRect(x, canvas.height - paddleWidth, paddleHeight, paddleWidth);
	}

    function drawBall() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.closePath();
    }

	function drawScore() {
		ctx.fillStyle = 'white';
		ctx.font = '30px Arial';
		// ctx.fillText(score1, canvas.width / 4, 50);
		// ctx.fillText(score2, canvas.width * 3 / 4, 50);
		ctx.fillText(score1, canvas.width / 10, canvas.height / 2);
		ctx.fillText(score2, canvas.width * 9 / 10, canvas.height / 2);
		if (numPlayers === 3) {
			ctx.fillText(score3, canvas.width / 2, canvas.height / 10);
		} else if (numPlayers === 4) {
			ctx.fillText(score3, canvas.width / 2, canvas.height / 10);
			ctx.fillText(score4, canvas.width / 2, canvas.height * 9 / 10);
		}
	}

    function draw() {
		if (winner !== null) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = 'white';
			ctx.font = '30px Arial';
			ctx.fillText(`Game Over! ${winner} wins!`, canvas.width / 2 - 150, canvas.height / 2);
			
			// End the game
			if (role === 'player1') {
				endGame(game_id);
			}

			socket.close();

			return;
		} else if (socket.readyState === WebSocket.CLOSED) {
			return;
		}

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle1();
        drawPaddle2();
		if (numPlayers === 3) {
			drawPaddle3();
		} else if (numPlayers === 4) {
			drawPaddle3();
			drawPaddle4();
		}
        drawBall();
		drawScore();

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

    document.addEventListener('keydown', async function(event) {
		if (winner !== null) return;
		if (socket.readyState === WebSocket.CLOSED) return;

        const key = event.key;
		let player = role;
        let direction = 0; // server expects 1 or -1
		let paddle = 0; // backend expects 1 or 2 as paddle value

		// console.log('..key pressed: ', key);
        if (key === 'ArrowUp' || key === 'w') {
            direction = -1;
        } else if (key === 'ArrowDown' || key === 's') {
            direction = 1;
        } else if (key === 'ArrowLeft' || key === 'a') {
			direction = -1;
		} else if (key === 'ArrowRight' || key === 'd') {
			direction = 1;
		}

		// console.log('..direction: ', direction);
		// console.log('..mode: ', mode);
        if (direction !== 0) {
            if (mode === 'Single' || mode === 'AI') {
				if (key === 'w' || key === 's') {
					player = 'player1';
				} else {
					player = 'player2';
				}
            }
			// Multiple players mode
			if (player === 'player1') {
				paddle = 1;
			} else if (player === 'player2') {
				paddle = 2;
			} else if (player === 'player3') {
				paddle = 3;
			} else if (player === 'player4') {
				paddle = 4;
			}

			// console.log('..player: ', player, ' paddle: ', paddle, ' direction: ', direction);
            // gameState = await movePaddle(game_id, paddle, direction);
			// updateGameState(gameState);
            await movePaddle(game_id, paddle, direction);
        }
    });

}
