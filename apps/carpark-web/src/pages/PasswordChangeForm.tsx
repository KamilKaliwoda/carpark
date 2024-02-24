import '../styles/Global.css';
import '../styles/PasswordChangeForm.css';
import { changePassword } from '../services/PasswordChangeForm';
import Root from '../root.component';

export const PasswordChangeForm = (props: any): JSX.Element => {
  return (
    <div className="StartPage">
      <div className="MainForm">
        <h1 className="title">Change user password</h1>
        <div className="coverPasswordChange">
          <label htmlFor="username">username</label>
          <input type="text" placeholder="username" id="username"></input>
          <label htmlFor="oldPassword">current password</label>
          <input type="password" placeholder="old password" id="oldPassword"></input>
          <label htmlFor="password">new password</label>
          <input type="password" placeholder="password" id="password"></input>
          <label htmlFor="password-repeat">repeat new password</label>
          <input type="password" placeholder="password" id="password-repeat"></input>
          <button className="password-btn" onClick={() => changePassword(props)}>
            Change password
          </button>
          <button onClick={() => props.onFormSwitch('login')}>
            Log in using an existing account
          </button>
        </div>
      </div>
    </div>
  );
};
