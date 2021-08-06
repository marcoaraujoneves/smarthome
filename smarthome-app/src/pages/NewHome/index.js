import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';
import {
  StyleSheet,
  KeyboardAvoidingView,
  SafeAreaView,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import logo from '../../assets/logo.png';

export default function NewHome() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [county, setCounty] = useState('');
  const [city, setCity] = useState('');
  const [hasError, setHasError] = useState(false);

  const dataNeeded = () => {
    return !name || !address || !country || !county || !city;
  };

  const handleSubmit = async () => {
    if (dataNeeded()) {
      return;
    }

    setHasError(false);

    try {
      console.log({name, address, country, county, city, hasError});
    } catch (err) {
      console.log(err.message);
      setHasError(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.form}>
        <Image source={logo} style={styles.logo} />

        <TextInput
          style={styles.input}
          placeholder="Type your name"
          placeholderTextColor="#868686"
          keyboardType="default"
          autoCapitalize="words"
          autoCorrect={false}
          value={name}
          onChangeText={setName}
        />

        {hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Please, fill in all the fields above.
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          disabled={() => dataNeeded()}
          onPress={handleSubmit}>
          <Text style={styles.buttonText}> Register </Text>
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

  errorContainer: {
    width: 320,
    padding: 16,
    backgroundColor: '#B00020',
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Roboto',
  },
});
