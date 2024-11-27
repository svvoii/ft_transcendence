// Check if Game ID is valid on the backend
async function validateGameId(gameId) {
	try {
		const response = await fetch(`/game/validate_game_id/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
			},
			body: JSON.stringify({ game_id: gameId }),
		});
		const data = await response.json();
		return data.is_valid;
	} catch (error) {
		console.error('Error validating game ID:', error);
		return false;
	}
}
export { validateGameId };


// Check Role availability in the game session on the backend
async function roleIsTaken(gameId, role) {
	try {
		const response = await fetch(`/game/check_role/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
			},
			body: JSON.stringify({ game_id: gameId, player_role: role }),
		});
		const data = await response.json();
		
		// * DEBUG * //
		console.log('..roleIsTaken().. data:', data);
		// * * * * * //

		return data.is_taken;
	} catch (error) {
		console.error('Error checking role availability:', error);
		return true;
	}
}
export { roleIsTaken };

// This function will initialize a new game session on the backend via fetch and return the game_link or/and game_id
async function requestGameSession() {
	const response = await fetch('/game/create_game/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({}),
	});

	if (!response.ok) {
		throw new Error(`ERROR: Server responded with ${response.status}`);
	}

	const data = await response.json();

	// * DEBUG * //
	// console.log('..requestGameSession().. game_id:', data.game_id);
	// console.log('..requestGameSession().. game_link:', data.game_link);
	// * * * * * //

	if (data.game_id) {
		// return data.game_link;
		return data.game_id;
	} else {
		throw new Error('Invalid game data');
	}
}
export { requestGameSession };


// These variables will be reset on page reload
let socket = null;
let game_initialized = false;

// This function will request to join an existing game session and assign a player role on the backend via fetch
// new WebSocket will be created to connect to the game session
async function joinGame(gameId, role) {
	// * DEBUG * //
	console.log('..joinGame().. socket:', socket);
	console.log('..joinGame().. game_initialized:', game_initialized);
	// * * * * * //
    try {
		const response = await fetch(`/game/join_game/${gameId}/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
			},
			body: JSON.stringify({player_role: role}),
		});

		const data = await response.json();

		if (!response.ok) {
			alert(data.error);
			return;
		}

		localStorage.setItem('game_id', gameId);
		localStorage.setItem('player_role', role);

		if (!socket) {
			// connect to the game session via new WebSocket
			socket = new WebSocket(`ws://${window.location.host}/ws/game/${gameId}/`);
		}

		if (!game_initialized) {
			initializeGame(socket, role);
			game_initialized = true;
		}

    } catch (error) {
		alert(error);
        // console.error('Error joining game session:', error);
    }
}
export { joinGame };


// This function will initialize the game logic and draw the game on the canvas
function initializeGame(socket, role) {
    const canvas = document.getElementById('canvasId'); // 'canvasId' must be the same as set for canvas in `getDomElements` function in GameBoard.js
    const context = canvas.getContext('2d');

    const paddleWidth = 10;
    const paddleHeight = 100;
    const ballRadius = 10;

	let paddle1Y;
	let paddle2Y;
	let ballX;
	let ballY;

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
		if (data.type === 'update_paddles') {
			paddle1Y = data.paddle1_y;
			paddle2Y = data.paddle2_y;
		} else if (data.type === 'update_ball') {
			ballX = data.ball_x;
			ballY = data.ball_y;
		}
    };

    function drawPaddle1() {
        context.fillStyle = 'white';
        context.fillRect(0, paddle1Y, paddleWidth, paddleHeight);
    }

    function drawPaddle2() {
        context.fillStyle = 'white';
        context.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight);
    }

    function drawBall() {
        context.beginPath();
        context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, true);
        context.fillStyle = 'white';
        context.fill();
        context.closePath();
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle1();
        drawPaddle2();
        drawBall();

        requestAnimationFrame(draw);
    }

	requestAnimationFrame(draw);

	function sendPaddleMovement(key) {
		if (role === 'spectator') {
			return;
		}
		const data = {
			key: key,
			player: role, // 'player1' or 'player2'
		};
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(data));
		}
		// * DEBUG * //
		// console.log('..sendPaddleMovement().. data:', data);
		// * * * * * //
	}

	document.addEventListener('keydown', function(event) {
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			sendPaddleMovement(event.key);
		}
	});

	draw();
}
export { initializeGame };


// TOAL WORkAROUND.. MUST BE DESTROYED and logic reworked (DREW HELP)
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

// This will extract the game ID from the game link (needed for joinGame)
// function extractGameId(gameLink) {
// 	try {
// 		const url = new URL(gameLink);
// 		const pathParts = url.pathname.split('/');

// 		// * DEBUG * //
// 		console.log('..extractGameId().. pathParts:', pathParts);
// 		// * * * * * //

// 		const joinIndex = pathParts.indexOf('join');
// 		if (joinIndex !== -1&& joinIndex + 1 < pathParts.length) {
// 			return pathParts[joinIndex + 1];
// 		} else {
// 			throw new Error('Invalid game link format');
// 		}
// 	} catch (error) {
// 		console.error('Error extracting game ID:', error);
// 		return null;
// 	}
// }
// export { extractGameId };
