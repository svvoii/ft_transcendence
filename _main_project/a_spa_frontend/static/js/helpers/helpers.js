export const loginCheck = async () => {
  try {
    const response = await fetch('/login_check/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.status === 'error') {
      console.error(data.message);
      return false;
    } else {
      return true;
    }
  } catch (error) {
    // console.error('Error:', error);
    return false;
  }
};