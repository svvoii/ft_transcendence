// Sending fetch requerst to the server to get the game_session

export async function getGameSession() {
	const response = await fetch('/game/create_game/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({}),
	});

	if (!response.ok) {
		throw new Error(`ERROR: Server saying: ${data.error}`);
	}

	const data = await response.json();
	console.log(data);

	if (data.game_id) {
		return data.game_id;
	} else {
		throw new Error('Game ID not found in the response');
	}
}

// These variables will be reset once the page is reloaded
var socket = null;
var game_initialized = false;

export async function joinGame(game_id) {
	console.log('..join game, socket: ', socket);
	console.log('..join game, game_initialized: ', game_initialized);
	console.log('..join game, id: ', game_id);

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
		alert('Error joining the game: ' + data.error);
		// throw new Error(data.error);
	}

	const role = data.role;
	// console.log('..join game, id: ', data.game_id);
	console.log('..join game, role: ', role);

	// localStorage.setItem('game_id', game_id);
	// localStorage.setItem('player_role', role);

	if (!socket) {
		socket = new WebSocket(`ws://${window.location.host}/ws/pong/${game_id}/`);
	}

	if (!game_initialized) {
		initializeGame(socket, role);
		game_initialized = true;
	}
}

function initializeGame(socket, role) {
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

	socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
		if (data.type === 'paddles_update') {
			paddle1 = data.paddle1;
			paddle2 = data.paddle2;
		} else if (data.type === 'ball_update') {
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

    document.addEventListener('keydown', function(event) {
        const key = event.key;
        if (key === 'ArrowUp' || key === 'ArrowDown') {
            socket.send(JSON.stringify({
                key: key,
                role: role
            }));
        }
    });

	draw();
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
