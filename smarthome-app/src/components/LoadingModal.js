import React from 'react';
import {StyleSheet, Modal, View, Image} from 'react-native';

export default function LoadingModal({isVisible}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {}}>
      <View style={styles.background}>
        <Image
          style={styles.animation}
          source={require('../assets/loading.gif')}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#000000EE',
    height: '100%',
    width: '100%',

    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    backgroundColor: '#242424',
    borderRadius: 4,
    width: '90%',
    maxHeight: 500,
    position: 'relative',
    padding: 24,
  },

  animation: {
    height: 75,
    width: 75,
  },
});
