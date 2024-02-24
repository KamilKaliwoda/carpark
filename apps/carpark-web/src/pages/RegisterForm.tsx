import '../styles/Global.css';
import '../styles/RegisterForm.css';
import { tryRegisteringNewAccount } from '../services/RegisterForm';
import Root from '../root.component';

export const RegisterForm = (props: any): JSX.Element => {
  return (
    <div className="StartPage">
      <div className="MainForm">
        <h1 className="title">Register account</h1>
        <div className="coverRegister">
          <label htmlFor="username">username</label>
          <input type="text" placeholder="username" id="username"></input>
          <label htmlFor="name">name</label>
          <input type="text" placeholder="name" id="name"></input>
          <label htmlFor="surname">surname</label>
          <input type="text" placeholder="surname" id="surname"></input>
          <label htmlFor="password">password</label>
          <input type="password" placeholder="password" id="password"></input>
          <label htmlFor="password-repeat">repeat password</label>
          <input type="password" placeholder="password" id="password-repeat"></input>
          <button className="register-btn" onClick={() => tryRegisteringNewAccount(props)}>
            Register
          </button>
          <button onClick={() => props.onFormSwitch('login')}>
            Log in using an existing account
          </button>
        </div>
      </div>
    </div>
  );
};
