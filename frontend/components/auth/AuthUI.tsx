'use client';

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthUIProps {
  viewProp?: 'signin' | 'signup';
  allowEmail?: boolean;
  allowOauth?: boolean;
  allowPassword?: boolean;
  redirectMethod?: string;
  disableButton?: boolean;
}

export default function AuthUI({
  viewProp = 'signin',
  allowEmail,
  allowOauth,
  allowPassword,
  redirectMethod,
  disableButton
}: AuthUIProps) {
  const [currentView, setCurrentView] = useState<'signin' | 'signup'>(viewProp);

  const switchToLogin = () => setCurrentView('signin');
  const switchToRegister = () => setCurrentView('signup');

  return (
    <div className="my-auto mb-auto mt-8 flex flex-col md:mt-[70px] md:max-w-full lg:mt-[130px] lg:max-w-[420px]">
      {currentView === 'signin' ? (
        <LoginForm onSwitchToRegister={switchToRegister} />
      ) : (
        <RegisterForm onSwitchToLogin={switchToLogin} />
      )}
    </div>
  );
}