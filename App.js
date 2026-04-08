// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    // Wrap everything in Redux Provider
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
};

export default App;
