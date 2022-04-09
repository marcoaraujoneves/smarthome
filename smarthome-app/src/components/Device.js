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
  const [device, setDevice] = useState({});

  useEffect(() => {
    const deviceRef = database().ref(`/device/${deviceId}`);

    const unsubscribe = deviceRef.on('value', deviceSnap => {
      if (deviceSnap.exists()) {
        setDevice({...deviceSnap.val(), id: deviceId});
        setLoading(false);
      }
    });

    return () => database().ref().off('value', unsubscribe);
  }, [deviceId]);

  const getRead = () => {
    if (typeof device.reads === 'undefined') {
      return '-';
    }

    return device.reads;
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
          <Icon name={deviceTypeIconsMap[device.type]} size="70" color="#fff" />
          <Text style={styles.deviceMeasure}>
            {getRead()} {device.unit || ''}
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
