import React, {useEffect} from 'react';
import {Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';

import AuthContext from '../contexts/auth';

import Login from '../pages/Login';

const Stack = createStackNavigator();

function AuthNavigator() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            user: action.user,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            user: action.user,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            user: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      user: null,
    },
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let logged_user;

      try {
        logged_user = await AsyncStorage.getItem('logged_user');

        if (!logged_user) {
          throw new Error('Dados de login não encontrados!');
        }

        // const response = await post('agency/sessions/validate', {
        //   token: JSON.parse(logged_user).token,
        // });

        // const areCredentialsValid = response.data.isAuthorized;

        // if (!areCredentialsValid) {
        //   await AsyncStorage.clear();

        //   dispatch({type: 'SIGN_OUT'});
        //   return;
        // }
      } catch (e) {
        dispatch({type: 'SIGN_OUT'});
        return;
      }

      dispatch({type: 'RESTORE_TOKEN', user: JSON.parse(logged_user)});
    };

    bootstrapAsync();
  }, []);

  const authFunctions = React.useMemo(
    () => ({
      signIn: async data => {
        try {
          if (!data.username || !data.password) {
            return;
          }

          // const response = await api.post('agency/sessions', {
          //   username: data.username,
          //   password: data.password,
          // });

          // await AsyncStorage.setItem(
          //   'logged_user',
          //   JSON.stringify(response.data),
          // );

          // dispatch({type: 'SIGN_IN', user: response.data});
        } catch (error) {
          Alert.alert('Dados incorretos', 'Confirme os dados inseridos!', [
            {text: 'Tentar Novamente', onPress: () => true},
          ]);
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.clear();
          dispatch({type: 'SIGN_OUT'});
        } catch (error) {
          Alert.alert(
            'Erro',
            'Os dados de login podem não ter sido removidos',
            [{text: 'Tentar Novamente', onPress: () => true}],
          );
        }
      },
      signUp: async data => {
        dispatch({type: 'SIGN_IN', token: 'dummy-auth-token'});
      },
    }),
    [],
  );

  return (
    <NavigationContainer>
      <AuthContext.Provider value={{authFunctions, user: state.user}}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#383838',
            },
            headerTitleAlign: 'center',
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          {state.user === null ? (
            <Stack.Screen
              name="Sign In"
              component={Login}
              options={{
                animationTypeForReplace: state.isSignout ? 'pop' : 'push',
              }}
            />
          ) : (
            <Stack.Screen name="TabNavigator" options={{headerShown: false}} />
          )}
        </Stack.Navigator>
      </AuthContext.Provider>
    </NavigationContainer>
  );
}

export default AuthNavigator;
