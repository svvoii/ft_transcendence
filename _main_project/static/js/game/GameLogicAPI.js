function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

// This will request the server to create a new game session and return the game ID
// No player is joined to the game at this point
export async function getGameSession() {
	const response = await fetch('/game/create_game/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({}),
	});

	const data = await response.json();
	// console.log(data);

	if (!response.ok) {
		throw new Error(`ERROR: Server saying: ${data.error}`);
	}

	if (data.game_id) {
		return data.game_id;
	} else {
		throw new Error('Game ID not found in the response');
	}
}

// These variables will be reset once the page is reloaded
var socket = null;
var game_initialized = false;

// This will request the server to join the player to the game session
// The player role will be returned as either 'player1' or 'player2'
export async function joinGame(game_id, mode) {

	const response = await fetch(`/game/join_game/${game_id}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({ game_id: game_id }),
	});

	const data = await response.json();

	console.log('..join game, data: ', data);

	if (!response.ok) {
		// alert('Error joining the game: ' + data.error);
		throw new Error(data.message || 'Error joining the game');
	}

	const role = data.role;

	// localStorage.setItem('game_id', game_id);
	// localStorage.setItem('player_role', role);

	if (!socket) {
		socket = new WebSocket(`ws://${window.location.host}/ws/pong/${game_id}/`);
	}

	if (!game_initialized) {
		initializeGame(socket, role, mode, game_id);
		game_initialized = true;
	}
	return data;
}


// This will request the server to fetch the current game state
// Game state includes the position of paddles, ball, and scores
async function fetchGameState(game_id) {
	// console.log('..fetch game state, game_id: ', game_id);

    const response = await fetch(`/game/game_state/${game_id}/`);
    if (!response.ok) {
        throw new Error('Failed to fetch game state');
    }
	const data = await response.json();
	// console.log('..fetch game state, data: ', data);
	// console.log('..paddle1: ', data.paddle1, ' paddle2: ', data.paddle2);

	return data;
}


// This will request the server to update the position of the paddle
// The server expects the paddle value as either 1 or 2
// The direction value is either -1 or 1
async function movePaddle(game_id, paddle, direction) {
	// console.log('..move paddle: paddle: ', paddle, ' direction: ', direction);
	
    const response = await fetch(`/game/move_paddle/${game_id}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ paddle, direction }),
    });

	const data = await response.json();
	// console.log('..move paddle, data: ', data);

    if (!response.ok) {
        throw new Error('Failed to move paddle');
    }
    return data;
}


// This will initialize the game logic
// It will draw the paddles and ball on the canvas
// The ball position is updated via WebSocket
// The paddle position is updated via API call on key press
async function initializeGame(socket, role, mode, game_id) {
    socket.onopen = function() {
        console.log('WebSocket connection established');
    };

    socket.onclose = function() {
        console.log('WebSocket connection closed');
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    const paddleHeight = 100;
    const paddleWidth = 10;
    const ballSize = 10;
    let paddle1;
    let paddle2;
    let ballX;
    let ballY;

	// console.log('Fetching game state for game_id: ', game_id);
    // Fetch initial game state
    const gameState = await fetchGameState(game_id);
	// console.log('..game state fetched: ', gameState);
    paddle1 = gameState.paddle1;
    paddle2 = gameState.paddle2;
    ballX = gameState.ball_x;
    ballY = gameState.ball_y;

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'ball_update') {
            ballX = data.ball_x;
            ballY = data.ball_y;
        }
    };

    function drawPaddle1() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, paddle1, paddleWidth, paddleHeight);
    }

    function drawPaddle2() {
        ctx.fillStyle = 'white';
        ctx.fillRect(canvas.width - paddleWidth, paddle2, paddleWidth, paddleHeight);
    }

    function drawBall() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.closePath();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle1();
        drawPaddle2();
        drawBall();

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

    document.addEventListener('keydown', async function(event) {
        const key = event.key;
		let player = role;
        let direction = 0; // server expects 1 or -1

		console.log('..key pressed: ', key);

        if (key === 'ArrowUp' || key === 'w') {
            direction = -1;
        } else if (key === 'ArrowDown' || key === 's') {
            direction = 1;
        }

        if (direction !== 0) {
            if (mode === 'single' || mode === 'ai') {
				player = 'player2';
            }
			let paddle = player === 'player1' ? 1 : 2; // backend expects 1 or 2 as paddle value
            await movePaddle(game_id, paddle, direction);
            const updatedGameState = await fetchGameState(game_id);
            paddle1 = updatedGameState.paddle1;
            paddle2 = updatedGameState.paddle2;
        }
    });

    draw();
}
