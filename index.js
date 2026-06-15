/**
 * @format
 */

import {AppRegistry} from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

notifee.registerForegroundService((notification) => {
  return new Promise(() => {});
});

AppRegistry.registerComponent(appName, () => App);
