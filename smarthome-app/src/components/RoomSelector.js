import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export default function RoomSelector({rooms, selectedRoom, setSelectedRoom}) {
  const selectRoom = roomId => {
    if (rooms[roomId]) {
      setSelectedRoom(roomId);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.values(rooms)}
        keyExtractor={room => room.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              styles.button,
              selectedRoom === item.id ? styles.buttonActive : null,
            ]}
            key={item.id}
            onPress={() => selectRoom(item.id)}>
            <Text
              style={[
                styles.buttonText,
                selectedRoom === item.id ? styles.buttonTextActive : null,
              ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222222',
    alignSelf: 'stretch',
    paddingHorizontal: 8,
  },

  button: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  buttonActive: {
    borderStyle: 'solid',
    borderBottomColor: '#FFFFFF',
    borderBottomWidth: 2,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Manrope',
  },

  buttonTextActive: {
    fontWeight: 'bold',
  },
});
