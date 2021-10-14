import React, {useEffect, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  View,
  Image,
  TextInput,
} from 'react-native';
import Icon from 'react-native-remix-icon';
import database from '@react-native-firebase/database';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

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
  const devices = new Map();
  const [selectedType, setSelectedType] = useState('');
  const [selectedDevice, setSelectedDevice] = useState();
  const [isScanning, setIsScanning] = useState(false);
  const [devicesList, setDevicesList] = useState([]);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');

  const startScan = async () => {
    if (!isScanning) {
      setDevicesList([]);
      setSelectedDevice(null);
      setSelectedType('');

      try {
        await BleManager.scan([], 15, false);
        setIsScanning(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
  };

  const retrieveConnected = async () => {
    const results = await BleManager.getConnectedPeripherals([]);
    for (let device of results) {
      device.connected = true;
      devices.set(device.id, device);
      setDevicesList(Array.from(devices.values()));
    }
  };

  const handleDisconnectedDevice = data => {
    let device = devices.get(data.peripheral);

    if (device) {
      device.connected = false;

      devices.set(device.id, device);
      setDevicesList(Array.from(devices.values()));
    }
  };

  const handleDiscoverDevice = device => {
    const deviceOnListResult = devicesList.find(
      deviceOnList => device.id === deviceOnList.id,
    );

    if (
      !deviceOnListResult &&
      device.name &&
      device.name.includes('SmartHome:')
    ) {
      devices.set(device.id, device);
      setDevicesList(Array.from(devices.values()));
    }
  };

  useEffect(() => {
    BleManager.start({showAlert: false});

    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverDevice,
    );
    bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      handleDisconnectedDevice,
    );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(hasPermission => {
        if (hasPermission) {
          startScan();
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(result => {
            if (result) {
              startScan();
            }
          });
        }
      });
    }

    return () => {
      bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
      bleManagerEmitter.removeListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverDevice,
      );
      bleManagerEmitter.removeListener(
        'BleManagerDisconnectPeripheral',
        handleDisconnectedDevice,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDevice && selectedDevice.name) {
      const componentTypeName = selectedDevice.name.replace('SmartHome: ', '');
      const componentType = componentTypes.find(
        type => type.type === componentTypeName.toLowerCase(),
      );

      if (componentType) {
        setSelectedType(componentType.type);
      }
    }
  }, [selectedDevice]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentRow}>
        <Text style={styles.text}>Choose a device:</Text>
      </View>

      {devicesList.length > 0 ? (
        <FlatList
          style={styles.devicesContainer}
          data={devicesList}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.device,
                selectedDevice && selectedDevice.id === item.id
                  ? styles.deviceActive
                  : null,
              ]}
              key={item.id}
              activeOpacity={1}
              onPress={() => {
                setSelectedDevice(item);
              }}>
              <Text style={styles.deviceName}>{item.name}</Text>
              <Text style={styles.deviceId}>({item.id})</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.loadingContainer}>
          {isScanning ? (
            <Image
              style={styles.animation}
              source={require('../../assets/loading.gif')}
            />
          ) : (
            <Text style={[styles.text, styles.noComponents]}>
              No components were found!
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => startScan()}>
                <Text style={[styles.text, styles.scanButton]}>
                  Click to scan again.
                </Text>
              </TouchableOpacity>
            </Text>
          )}
        </View>
      )}

      {selectedType ? (
        <>
          <View style={styles.contentRow}>
            <Text style={styles.text}>Component type:</Text>
          </View>
          <View style={styles.componentTypesWrapper}>
            <FlatList
              data={componentTypes}
              keyExtractor={type => type.type}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typesList}
              renderItem={({item}) => (
                <View
                  style={[
                    styles.icon,
                    selectedType === item.type ? styles.iconActive : null,
                  ]}
                  key={item.type}
                  activeOpacity={1}
                  onPress={() => setSelectedType(item.type)}>
                  <Icon
                    name={item.icon}
                    size="36"
                    color={selectedType === item.type ? '#fff' : '#555'}
                  />
                </View>
              )}
            />
          </View>
        </>
      ) : null}

      {selectedDevice ? (
        <>
          <View style={styles.contentRow}>
            <Text style={styles.text}>Connect it to the Wi-Fi network:</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Type your network name"
            placeholderTextColor="#868686"
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            value={ssid}
            onChangeText={setSsid}
          />

          <TextInput
            style={styles.input}
            placeholder="Type your network password"
            placeholderTextColor="#868686"
            keyboardType="default"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.connectButton}
            disabled={!ssid || !password}
            onPress={() => {}}>
            <Text style={styles.connectButtonText}> Connect </Text>
          </TouchableOpacity>
        </>
      ) : null}
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
    paddingVertical: 24,
    paddingHorizontal: 16,
  },

  contentRow: {
    marginHorizontal: 17,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  componentTypesWrapper: {
    height: 70,
    marginBottom: 40,
  },

  typesList: {
    width: '100%',
    justifyContent: 'flex-start',
  },

  icon: {
    marginRight: 16,
    height: 70,
    padding: 16,
    borderRadius: 6,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#343434',
  },

  iconActive: {
    borderColor: '#FFFFFF',
  },

  text: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Manrope',
  },

  loadingContainer: {
    width: '100%',
    minHeight: 50,
    flexGrow: 0,
    alignItems: 'center',
    padding: 24,
  },

  devicesContainer: {
    width: '100%',
    minHeight: 50,
    flexGrow: 0,
    backgroundColor: '#232323',
    borderRadius: 4,
    marginHorizontal: 16,
    marginBottom: 40,
  },

  device: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  deviceActive: {
    borderColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
  },

  deviceName: {
    fontFamily: 'Manrope',
    color: '#ffffff',
    fontSize: 18,
  },

  deviceId: {
    fontFamily: 'Manrope',
    color: '#848484',
    fontSize: 14,
  },

  noComponents: {
    textAlign: 'center',
  },

  scanButton: {
    opacity: 0.75,
    textDecorationLine: 'underline',
  },

  animation: {
    height: 50,
    width: 50,
  },

  input: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#486581',
    color: '#FFFFFF',
    fontSize: 16,
    padding: 16,
    height: 48,
    width: '100%',
    borderRadius: 4,
    marginBottom: 16,
    fontFamily: 'Roboto',
  },

  connectButton: {
    width: '100%',
    padding: 12,
    backgroundColor: '#102A43',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 8,
  },

  connectButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Roboto',
  },
});
