// The following functions are fetch requests to the server to get data related to the user profile.

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


// This fetch request will update the online status of the user.
// API endpoint in `a_user/views.py` --> api_update_online_status_view
/*
export async function updateOnlineStatus(online) {
	const response = await fetch('/update_online_status/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'X-Requested-With': 'XMLHttpRequest',
		},
		body: JSON.stringify({ online: online }),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(`ERROR: Server saying: ${data.error}`);
	}

	if (data) {
		// DEBUG //
		console.log('..updateOnlineStatus, data: ', data);
		return data;
	} else {
		throw new Error('Data not found in the response');
	}
}


// This fetch request will check if the user is online.
// API endpoint in `a_user/views.py` --> api_get_online_status_view
export async function getOnlineStatus(username) {
	const response = await fetch(`/check_online_status/${username}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'X-Requested-With': 'XMLHttpRequest',
		},
		body: JSON.stringify({}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(`ERROR: Server saying: ${data.error}`);
	}

	if (data) {
		// DEBUG //
		console.log('..getOnlineStatus, data: ', data);
		return data;
	} else {
		throw new Error('Data not found in the response');
	}
}
*/


// This fetch request will get the data from UserGameStats model.
// API endpoint in `a_user/views.py` --> /user/stats/<str:stats_username>/
// The request shall pass the username of the profile to get the stats for.
export async function getUserGameStats(username) {
	const response = await fetch(`/user/stats/${username}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'X-Requested-With': 'XMLHttpRequest',
		},
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(`ERROR: Server saying: ${data.error}`);
	}

	return data;
}


// This fetch request will get the match history for the fiven user.
// API endpoint in `a_user/views.py` --> /user/match_history/<str:username>/
// The request shall pass the username of the profile to get the match history for.
export async function getUserMatchHistory(username) {
	const response = await fetch(`/user/match_history/${username}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'X-Requested-With': 'XMLHttpRequest',
		},
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(`ERROR: Server saying: ${data.error}`);
	}

	return data;
}

