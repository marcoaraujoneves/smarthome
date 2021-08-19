import React, {useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-remix-icon';
import database from '@react-native-firebase/database';

const componentTypes = [
  {
    type: 'temperature',
    name: 'Temperature',
    icon: 'ri-temp-cold-line',
  },
  {
    type: 'light',
    name: 'Light Level',
    icon: 'ri-sun-line',
  },
];

export default function NewComponent() {
  const [selectedType, setSelectedType] = useState(componentTypes[0].type);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={componentTypes}
        keyExtractor={type => type.type}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              styles.button,
              selectedType === item.type ? styles.buttonActive : null,
            ]}
            key={item.type}
            activeOpacity={1}
            onPress={() => setSelectedType(item.type)}>
            <Icon
              name={item.icon}
              size="36"
              color={selectedType === item.type ? '#fff' : '#555'}
            />
          </TouchableOpacity>
        )}
      />

      <Text>Marco</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#121212',
    alignSelf: 'stretch',
  },

  button: {
    marginRight: 16,
    height: 70,
    padding: 16,
    borderRadius: 6,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#343434',
  },

  buttonActive: {
    borderColor: '#FFFFFF',
  },
});
