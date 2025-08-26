import { registerRootComponent } from 'expo';
import App from './App';

// Register the root component of the application. This tells Expo and React Native
// what to render on app startup. Without this, you'll see errors like
// "Component auth has not been registered" or "main has not been registered".
registerRootComponent(App);