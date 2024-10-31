export const loginCheck = async (return_data = false) => {
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