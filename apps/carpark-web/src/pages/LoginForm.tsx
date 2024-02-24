import '../styles/Global.css';
import '../styles/LoginForm.css';
import { validateLogin } from '../services/LoginForm';
import Root from '../root.component';

export const LoginForm = (props: any): JSX.Element => {
  return (
    <div className="StartPage">
      <div className="MainForm">
        <h1 className="title">Log in account</h1>
        <div className="coverLogin">
          <label htmlFor="username">username</label>
          <input type="text" placeholder="username" id="username"></input>
          <label htmlFor="password">password</label>
          <input type="password" placeholder="password" id="password"></input>
          <button className="login-btn" onClick={() => validateLogin(props)}>
            Log in
          </button>
          <button onClick={() => props.onFormSwitch('register')}>Register new account</button>
          <button onClick={() => props.onFormSwitch('passwordChange')}>Change user password</button>
        </div>
      </div>
    </div>
  );
};
