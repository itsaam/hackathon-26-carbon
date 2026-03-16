import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { getToken, logout } from '../services/auth';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SiteListScreen from '../screens/SiteListScreen';
import SiteDetailScreen from '../screens/SiteDetailScreen';
import SiteFormScreen from '../screens/SiteFormScreen';
import CompareScreen from '../screens/CompareScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  SiteList: undefined;
  SiteDetail: { id: number };
  SiteForm: undefined;
  Compare: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Splash');

  useEffect(() => {
    (async () => {
      const token = await getToken();
      setInitialRoute(token ? 'SiteList' : 'Login');
    })();
  }, []);

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerStyle: { backgroundColor: '#020617' }, headerTintColor: '#e5e7eb' }}>
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
      <Stack.Screen name="SiteList" component={SiteListScreen} options={{ title: 'Sites' }} />
      <Stack.Screen name="SiteDetail" component={SiteDetailScreen} options={{ title: 'Détail du site' }} />
      <Stack.Screen name="SiteForm" component={SiteFormScreen} options={{ title: 'Nouveau site' }} />
      <Stack.Screen name="Compare" component={CompareScreen} options={{ title: 'Comparer des sites' }} />
    </Stack.Navigator>
  );
}
