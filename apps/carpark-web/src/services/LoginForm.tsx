import axios from 'axios';

export async function validateLogin(props: any) {
  const username = (document.getElementById('username') as HTMLInputElement).value;
  let password = (document.getElementById('password') as HTMLInputElement).value;
  if (username === null || password === null) {
    alert('Invalid login or password');
    return;
  }
  const user_data = await axios
    .get('http://' + String(process.env.API_IP) + ':' + String(process.env.API_PORT) + '/validateLogIn', {
      params: {
        username: username,
        password: password,
      },
    })
    .then((response) => {
      return response.data;
    });
  if (user_data.length === 0) {
    alert('Invalid login or password');
    return;
  }
  localStorage.setItem('currentUsername', username);
  localStorage.setItem('currentName', user_data[0]['name']);
  localStorage.setItem('currentSurname', user_data[0]['surname']);
  localStorage.setItem('role', user_data[0]['role']);
  props.onFormSwitch('booking');
}

