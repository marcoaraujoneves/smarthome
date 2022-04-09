import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import Icon from 'react-native-remix-icon';
import database from '@react-native-firebase/database';

const deviceTypeIconsMap = {
  temperature: 'ri-temp-cold-line',
  brightness: 'ri-sun-line',
  umidity: 'ri-drop-line',
};

export default function Device({deviceId, margin}) {
  const [loading, setLoading] = useState(true);
  const [lastRead, setLastRead] = useState(null);
  const [deviceType, setDeviceType] = useState(null);
  const [deviceUnit, setDeviceUnit] = useState(null);

  useEffect(() => {
    const deviceRef = database().ref(`/device/${deviceId}`);

    deviceRef
      .child('type')
      .once('value')
      .then(typeSnap => {
        setDeviceType(typeSnap.val());
        setLoading(false);
      });

    deviceRef
      .child('unit')
      .once('value')
      .then(unitSnap => setDeviceUnit(unitSnap.val()));

    const unsubscribe = deviceRef
      .child('reads')
      .limitToLast(1)
      .on('value', readSnap => {
        if (readSnap.exists()) {
          const [lastReadObject] = Object.values(readSnap.val());

          setLastRead(lastReadObject.value);
        }
      });

    return () => database().ref().off('value', unsubscribe);
  }, [deviceId]);

  const getRead = () => {
    return lastRead !== null ? lastRead : '-';
  };

  return (
    <View
      style={[
        styles.deviceContainer,
        margin,
        loading ? styles.loadingDevice : styles.loadedDevice,
      ]}>
      {loading ? (
        <Image
          style={styles.animation}
          source={require('../assets/loading.gif')}
        />
      ) : (
        <>
          <Icon name={deviceTypeIconsMap[deviceType]} size="70" color="#fff" />
          <Text style={styles.deviceMeasure}>
            {getRead()} {deviceUnit || ''}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  deviceContainer: {
    borderRadius: 6,
    height: 170,
    width: 170,
    marginTop: 39,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingDevice: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#2e2e2e',
    backgroundColor: '#121212',
  },

  loadedDevice: {
    backgroundColor: '#2e2e2e',
  },

  deviceMeasure: {
    marginTop: 30,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Roboto',
  },

  animation: {
    height: 50,
    width: 50,
  },
});
