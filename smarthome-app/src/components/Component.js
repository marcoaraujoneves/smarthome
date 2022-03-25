import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import Icon from 'react-native-remix-icon';
import database from '@react-native-firebase/database';

const componentNames = {
  temperature: 'ri-temp-cold-line',
  brightness: 'ri-sun-line',
  umidity: 'ri-drop-line',
};

export default function Component({componentId, margin}) {
  const [loading, setLoading] = useState(true);
  const [component, setComponent] = useState({});

  useEffect(() => {
    const componentRef = database().ref(`/component/${componentId}`);

    const unsubscribe = componentRef.on('value', componentSnap => {
      if (componentSnap.exists()) {
        setComponent({...componentSnap.val(), id: componentId});
        setLoading(false);
      }
    });

    return database().ref().off('value', unsubscribe);
  }, [componentId]);

  const getRead = () => {
    if (typeof component.reads === 'undefined') {
      return '-';
    }

    return component.reads;
  };

  return (
    <View
      style={[
        styles.component,
        margin,
        loading ? styles.loadingComponent : styles.loadedComponent,
      ]}>
      {loading ? (
        <Image
          style={styles.animation}
          source={require('../assets/loading.gif')}
        />
      ) : (
        <>
          <Icon name={componentNames[component.type]} size="70" color="#fff" />
          <Text style={styles.componentMeasure}>
            {getRead()} {component.unit || ''}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  component: {
    borderRadius: 6,
    height: 170,
    width: 170,
    marginTop: 39,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingComponent: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#2e2e2e',
    backgroundColor: '#121212',
  },

  loadedComponent: {
    backgroundColor: '#2e2e2e',
  },

  componentMeasure: {
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
