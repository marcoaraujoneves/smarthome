import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

import RoomModal from '../../components/RoomModal';
import LoadingModal from '../../components/LoadingModal';

export default function Dashboard({navigation}) {
  const [user, setUser] = useState({});
  const [home, setHome] = useState({});
  const [rooms, setRooms] = useState({});
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!auth().currentUser) {
        return;
      }

      setIsLoading(true);

      const {uid: userId} = auth().currentUser;

      const userSnap = await database().ref(`/user/${userId}`).once('value');

      if (!userSnap.exists()) {
        return;
      }

      const userData = userSnap.val();
      setUser(userData);

      if (!userData.home) {
        navigation.navigate('Register Home');
        return;
      }

      await loadHome(userData.home, true);

      setIsLoading(false);
    };

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const loadHome = async (homeId, shouldNavigateIfNotExists) => {
    const homeSnap = await database().ref(`home/${homeId}`).once('value');

    if (!homeSnap.exists() && shouldNavigateIfNotExists) {
      navigation.navigate('Register Home');
      return;
    }

    const homeData = homeSnap.val();

    setHome({
      ...homeData,
      id: homeId,
    });

    if (homeData.rooms) {
      await loadRooms(homeData.rooms);
    }
  };

  const loadRooms = async roomsIds => {
    const newRoomsObject = {};

    for (let roomId of roomsIds) {
      const roomSnap = await database().ref(`/room/${roomId}`).once('value');

      if (roomSnap.exists()) {
        setRooms({
          ...newRoomsObject,
          [roomId]: {...roomSnap.val(), id: roomId},
        });
      }
    }
  };

  const handleNewRoom = async action => {
    switch (action) {
      case 'LOADING':
        setIsLoading(true);
        break;
      case 'DONE':
        await loadHome(home.id);
        setIsLoading(false);
        break;
    }
  };

  return home && home.rooms ? (
    <SafeAreaView style={styles.container}>
      <Text>Dashboard {user ? user.name : ''}</Text>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowRoomModal(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Text style={styles.emptyScreenMessage}>
        To start using this app, you need to add rooms and components. Just
        click the button above!
      </Text>

      <RoomModal
        isVisible={showRoomModal}
        setIsVisible={setShowRoomModal}
        handleNewRoom={handleNewRoom}
      />
      <LoadingModal isVisible={isLoading} setIsVisible={setShowRoomModal} />
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

  addButton: {
    width: 205,
    height: 205,
    borderColor: '#486581',
    borderStyle: 'dashed',
    borderWidth: 4,
    borderRadius: 40,
    marginBottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    fontSize: 200,
    lineHeight: 210,
    color: '#486581',
  },

  emptyScreenMessage: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Roboto',
    lineHeight: 20,
    textAlign: 'center',
  },
});
