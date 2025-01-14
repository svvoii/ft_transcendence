import { router } from './router.js';

// Checks the login status of the user.
export const loginCheck = async (return_data = false) => {
  try {
    const response = await fetch('/login_check/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const data = await response.json();

    if (data.status === 'error') {
      console.error(data.message);
      return false;
    } else {
      if (return_data) {
        return data;
      } else {
        return true;
      }
    }
  } catch (error) {
    // console.error('Error:', error);
    return false;
  }
};

// Create a regex to replace the path with something.
export const pathToRegex = path => new RegExp('^' + path.replace(/\//g, "\\/").replace(/:\w+/g, '(.+)') + '$');

// Finds the key and the values for our params
export const getParams = match => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

  return Object.fromEntries(keys.map((key, i) => {
    return [key, values[i]];
  }));
}

// Allows us to use the history API to navigate to different routes
export const navigateTo = url => {
  history.pushState(null, null, url);
  router();
}