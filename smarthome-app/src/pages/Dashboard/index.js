import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

export default function Dashboard({navigation}) {
  const [user, setUser] = useState({});

  useEffect(() => {
    const loadUserData = async () => {
      const {uid: userId} = auth().currentUser;

      const userData = await database().ref(`/user/${userId}`).once('value');
      setUser(userData);

      if (!userData.home) {
        navigation.navigate('Register Home');
      }
    };

    loadUserData();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Text>Dashboard {user ? user.name : ''}</Text>
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
});
