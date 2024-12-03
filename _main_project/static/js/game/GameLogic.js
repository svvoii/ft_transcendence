// Sending fetch requerst to the server to get the game_session

export async function getGameSession() {
	const response = await fetch('/create_game/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({}),
	});

	const data = await response.json();
	console.log(data);

	if (response.ok) {
		return data.game_id;
	} else {
		throw new Error(data.error);
	}

}

var socket = null;
var game_initialized = false;

export async function joinGame(game_id) {
	const response = await fetch('/join_game/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({ game_id }),
	});

	if (response.status !== 200) {
		throw new Error(data.error);
	}

	const data = await response.json();
	const role = data.role;
	console.log('..join game, id: ', data.game_id);
	console.log('..join game, role: ', role);


	if (!socket) {
		socket = new WebSocket(`ws://${window.location.host}/ws/game/${game_id}/`);
	}

	if (!game_initialized) {
		initializeGame(socket, role);
		game_initialized = true;
	}
}

function initializeGame(socket, role) {
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    const paddleHeight = 100;
    const paddleWidth = 10;
    const ballSize = 10;

    function drawPaddle(x, y) {
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, paddleWidth, paddleHeight);
    }

    function drawBall(x, y) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, ballSize, 0, Math.PI * 2);
        ctx.fill();
    }

    function updateGameState(data) {
        const paddle1Y = data.paddle1;
        const paddle2Y = data.paddle2;
        const ballX = data.ballX;
        const ballY = data.ballY;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle(0, paddle1Y);
        drawPaddle(canvas.width - paddleWidth, paddle2Y);
        drawBall(ballX, ballY);
    }

    socket.onopen = function() {
        console.log('WebSocket connection established');
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        updateGameState(data);
    };

    socket.onclose = function() {
        console.log('WebSocket connection closed');
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

    document.addEventListener('keydown', function(event) {
        const key = event.key;
        if (key === 'ArrowUp' || key === 'ArrowDown') {
            socket.send(JSON.stringify({
                key: key,
                role: role
            }));
        }
    });
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
