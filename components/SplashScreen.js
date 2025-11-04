import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const AppSplash = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_j1dawwgj.json' }} // Add your Lottie file
        autoPlay
        loop
        style={styles.animation}
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
  animation: {
    width: width * 0.8,
    height: height * 0.8,
  },
});

export default AppSplash;