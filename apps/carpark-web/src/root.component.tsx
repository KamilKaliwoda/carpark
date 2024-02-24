import { useState } from 'react';
import React from 'react';


import { CarparkBookingPage } from './pages/CarparkBookingPage';
import { LoginForm } from './pages/LoginForm';
import { RegisterForm } from './pages/RegisterForm';
import { PasswordChangeForm } from './pages/PasswordChangeForm';

export default function Root(props: any) {
  const [currentForm, setCurrentForm] = useState('login');
  const toggleForm = (formName: any) => {
    setCurrentForm(formName);
  };
  return (
    <div>
      {currentForm === 'login' ? (
        <LoginForm onFormSwitch={toggleForm} />
      ) : currentForm === 'register' ? (
        <RegisterForm onFormSwitch={toggleForm} />
      ) : currentForm === 'passwordChange' ? (
        <PasswordChangeForm onFormSwitch={toggleForm} />
      ) : (
        <CarparkBookingPage onFormSwitch={toggleForm} />
      )}
    </div>
  );
}
