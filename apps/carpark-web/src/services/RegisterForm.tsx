import axios from 'axios';

async function checkIfLoginCanBeRegistered(): Promise<boolean> {
  const username = (document.getElementById('username') as HTMLInputElement).value;
  if (username === '') {
    return false;
  }

  const user_data = await axios
    .get('http://' + String(process.env.API_IP) + ':' + String(process.env.API_PORT) + '/checkIfLoginExists', {
      params: {
        username: username,
      },
    })
    .then((response) => {
      return response.data;
    });
  if (user_data.length === 0) {
    return true;
  } else {
    return false;
  }
}

async function tryInsertingNewUser(props: any) {
  const username = (document.getElementById('username') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;
  const password_repeat = (document.getElementById('password-repeat') as HTMLInputElement).value;
  const name = (document.getElementById('name') as HTMLInputElement).value;
  const surname = (document.getElementById('surname') as HTMLInputElement).value;
  if (password === '' || password_repeat === '' || name === '' || surname === '') {
    alert('Invalid data');
    return;
  }
  if (password !== password_repeat) {
    alert('Passwords need to be identical');
    return;
  }

  const operation_success = await axios
    .get('http://' + String(process.env.API_IP) + ':' + String(process.env.API_PORT) + '/tryInsertingNewUser', {
      params: {
        username: username,
        password: password,
        name: name,
        surname: surname,
      },
    })
    .then((response) => {
      return response.data;
    });
  if (operation_success === true) {
    alert('User has been added to the system');
    (document.getElementById('username') as HTMLInputElement).value = '';
    (document.getElementById('password') as HTMLInputElement).value = '';
    (document.getElementById('password-repeat') as HTMLInputElement).value = '';
    (document.getElementById('name') as HTMLInputElement).value = '';
    (document.getElementById('surname') as HTMLInputElement).value = '';
    props.onFormSwitch('login');
  } else {
    alert('Error during adding new user');
  }
}

export async function tryRegisteringNewAccount(props: any) {
  const registration_allowed: boolean = await checkIfLoginCanBeRegistered();
  if (!registration_allowed) {
    alert('Login already exists');
    return;
  }
  tryInsertingNewUser(props);
}
