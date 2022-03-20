import React, {useState, useEffect} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-remix-icon';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

import RoomModal from '../../components/RoomModal';
import LoadingModal from '../../components/LoadingModal';
import RoomSelector from '../../components/RoomSelector';

const componentNames = {
  temperature: 'ri-temp-cold-line',
  brightness: 'ri-sun-line',
  umidity: 'ri-drop-line',
};

export default function Dashboard({navigation}) {
  const [user, setUser] = useState({});
  const [home, setHome] = useState({});
  const [rooms, setRooms] = useState({});
  const [components, setComponents] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
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

    const unsubscribe = navigation.addListener('focus', loadUserData);

    return unsubscribe;
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
        newRoomsObject[roomId] = {...roomSnap.val(), id: roomId};
      }
    }

    const firstKey = Object.keys(newRoomsObject)[0];

    if (firstKey) {
      setSelectedRoom(firstKey);
    }

    setRooms(newRoomsObject);
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

  const getComponentMargin = id => {
    const componentIndex = rooms[selectedRoom].components.findIndex(
      componentId => componentId === id,
    );

    let marginLeft = 0;

    if (componentIndex % 2 === 1) {
      marginLeft = 39;
    }

    return {marginLeft};
  };

  useEffect(() => {
    const loadComponents = async () => {
      if (
        rooms &&
        selectedRoom &&
        rooms[selectedRoom] &&
        rooms[selectedRoom].components
      ) {
        const newComponentsArray = [];

        for (let componentId of rooms[selectedRoom].components) {
          const componentSnap = await database()
            .ref(`/component/${componentId}`)
            .once('value');

          if (componentSnap.exists()) {
            newComponentsArray.push({...componentSnap.val(), id: componentId});
          }
        }

        setComponents(newComponentsArray);
      }
    };

    loadComponents();
  }, [selectedRoom, rooms]);

  const getRead = component => {
    if (typeof component.reads === 'undefined') {
      return '-';
    }

    return component.reads;
  };

  const componentsListView = (
    <FlatList
      numColumns={2}
      style={styles.componentsContainer}
      contentContainerStyle={styles.componentsContainerStyle}
      data={components}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <View
          style={[styles.component, getComponentMargin(item.id)]}
          key={item.id}>
          <Icon name={componentNames[item.type]} size="70" color="#fff" />
          <Text style={styles.componentMeasure}>
            {getRead(item)} {item.unit || ''}
          </Text>
        </View>
      )}
    />
  );

  const createComponentView = (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('Create Component', {
            room: selectedRoom,
          })
        }>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Text style={styles.emptyScreenMessage}>
        To start using this app, you need to add components. Just click the
        button above!
      </Text>
    </SafeAreaView>
  );

  return !isLoading && home && home.rooms ? (
    <SafeAreaView style={{...styles.container, ...styles.containerWithTabs}}>
      <RoomSelector
        rooms={rooms}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
      />

      {rooms && rooms[selectedRoom] && rooms[selectedRoom].components
        ? componentsListView
        : createComponentView}
    </SafeAreaView>
  ) : (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowRoomModal(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Text style={styles.emptyScreenMessage}>
        To start using this app, you need to add rooms. Just click the button
        above!
      </Text>

      <RoomModal
        isVisible={showRoomModal}
        setIsVisible={setShowRoomModal}
        handleNewRoom={handleNewRoom}
      />

      <LoadingModal isVisible={isLoading} />
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

  containerWithTabs: {
    justifyContent: 'flex-start',
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

  componentsContainer: {},

  componentsContainerStyle: {
    flex: 1,
    width: 379,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  component: {
    backgroundColor: '#2e2e2e',
    borderRadius: 6,
    height: 170,
    width: 170,
    marginTop: 39,
    justifyContent: 'center',
    alignItems: 'center',
  },

  componentMeasure: {
    marginTop: 30,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Roboto',
  },
});
