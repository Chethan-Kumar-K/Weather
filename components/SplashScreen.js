import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/splash-icon.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    height: height,
  },
  image: {
    width: width * 0.7, // 70% of screen width
    height: height * 0.7, // 70% of screen height
    maxWidth: 300,
    maxHeight: 300,
  },
});

export default SplashScreen;