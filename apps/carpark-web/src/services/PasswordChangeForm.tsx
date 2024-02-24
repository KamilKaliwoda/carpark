import axios from 'axios';

async function checkUserDataCorrectness(): Promise<boolean> {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('oldPassword') as HTMLInputElement).value;
    const newPassword = (document.getElementById('password') as HTMLInputElement).value;
    const newPasswordRepeat = (document.getElementById('password-repeat') as HTMLInputElement).value;
    if (username === '' || password === '' || newPassword === '' || newPasswordRepeat === '') {
      alert('Fields cannot be empty');
      return false;
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
        return false;
    }

    if (newPassword !== newPasswordRepeat) {
      alert('New passwords must to be identical');
      return false;
    }
    return true;
  }

export async function changePassword(props: any) {
    const operation_allowed: boolean = await checkUserDataCorrectness();
    if (operation_allowed) {
      const username = (document.getElementById('username') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      const operation_success = await axios
        .get('http://' + String(process.env.API_IP) + ':' + String(process.env.API_PORT) + '/changeUserPassword', {
          params: {
            username: username,
            password: password,
          },
        })
        .then((response) => {
          return response.data;
        });
      if (operation_success === true) {
        alert('Password has been changed');
        (document.getElementById('username') as HTMLInputElement).value = '';
        (document.getElementById('password') as HTMLInputElement).value = '';
        (document.getElementById('password-repeat') as HTMLInputElement).value = '';
        (document.getElementById('oldPassword') as HTMLInputElement).value = '';
        props.onFormSwitch('login');
      } else {
        alert('Error during changing password');
      }
    }
  }