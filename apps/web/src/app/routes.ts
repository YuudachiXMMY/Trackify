import { createBrowserRouter } from 'react-router';
import { Root } from './components/Root';
import { HomeScreen } from './components/HomeScreen';
import { ScanScreen } from './components/ScanScreen';
import { AIChatScreen } from './components/AIChatScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomeScreen },
      { path: 'scan', Component: ScanScreen },
      { path: 'chat', Component: AIChatScreen },
      { path: 'progress', Component: ProgressScreen },
      { path: 'profile', Component: ProfileScreen },
      { path: 'login', Component: LoginScreen },
      { path: 'signup', Component: SignupScreen },
    ],
  },
]);