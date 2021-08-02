import React, {useState} from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  SafeAreaView,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import AuthContext from '../../contexts/auth';

import logo from '../../assets/logo.png';

export default function Login({route}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const {authFunctions} = React.useContext(AuthContext);

  const handleSubmit = async () => {
    if (!username || !password) {
      return;
    }

    authFunctions.signIn({username, password});
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.form}>
        <Image source={logo} style={styles.logo} />

        <TextInput
          style={styles.input}
          placeholder="Type your email"
          placeholderTextColor="#868686"
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Type your password"
          placeholderTextColor="#868686"
          keyboardType="default"
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}> Login </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    alignSelf: 'stretch',
  },

  form: {
    alignSelf: 'stretch',
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    marginBottom: 56,
  },

  input: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#486581',
    color: '#FFFFFF',
    fontSize: 16,
    padding: 16,
    height: 48,
    width: 320,
    borderRadius: 4,
    marginBottom: 24,
    fontFamily: 'Roboto',
  },

  button: {
    width: 320,
    padding: 16,
    backgroundColor: '#102A43',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 64,
  },

  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'Roboto',
  },
});
