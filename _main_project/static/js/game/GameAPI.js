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
export async function getGameSession(mode) {
	const response = await fetch('/game/create_game/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({
			mode: mode,
		}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(`ERROR: Server saying: ${data.error}`);
	}

	if (data.game_id) {
		return data.game_id;
	} else {
		throw new Error('Game ID not found in the response');
	}
}

// This will request the server to join the player to the game session
// The player role will be returned as either 'player1' or 'player2'
export async function joinGame(game_id) {

	const response = await fetch(`/game/join_game/${game_id}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({}),
	});

	const data = await response.json();

	console.log('..join game, data: ', data);

	if (!response.ok) {
		throw new Error(data.message || 'Error joining the game');
	}

	return data.role;
}


// This will request the server to fetch the current game state
// Game state includes the position of paddles, ball, and scores
export async function fetchGameState(game_id) {

    const response = await fetch(`/game/game_state/${game_id}/`);
    if (!response.ok) {
        throw new Error('Failed to fetch game state');
    }
	const data = await response.json();

	return data;
}


// This will request the server to update the position of the paddle
// The server expects the paddle value as either 1 or 2
// The direction value is either -1 or 1
export async function movePaddle(game_id, paddle, direction) {
	
    const response = await fetch(`/game/move_paddle/${game_id}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ paddle, direction }),
    });

    if (!response.ok) {
        throw new Error('Failed to move paddle');
    }

	const data = await response.json();
	// console.log('..movePaddle, data: ', data);
    return data;
}


// This will request the server to end the game
export async function endGame(game_id) {

	const response = await fetch(`/game/end_game/${game_id}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({}),
	});

	if (!response.ok) {
		throw new Error('Failed to end the game');
	}
}


// This will request the server to quit the game
export async function quitGame() {

	const response = await fetch('/game/quit_game/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({}),
	});

	if (!response.ok) {
		// throw new Error('Failed to quit the game');
	}

}


// This will request the server to create a new game session with 2 players in it
// Player 1 and Player 2 usernames are sent to the server
export async function createGameWith2Players(username1, username2) {

	const response = await fetch('/game/create_game_with_2_players/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
		},
		body: JSON.stringify({
			player1: username1,
			player2: username2,
		}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(`ERROR: Server saying: ${data.error}`);
	}

	if (data.game_id && data.role) {
		return { game_id: data.game_id, role: data.role };
	} else {
		throw new Error('Game ID not found in the response');
	}
}
