import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
//import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const FutureForecast = ({ weatherData }) => {
  if (!weatherData || weatherData.length === 0) {
    return (
      <View style={styles.noData}>
        <Text style={styles.noDataText}>Loading forecast...</Text>
      </View>
    );
  }

  const data = weatherData.slice(1); // skip today

  return (
    <View style={styles.container}>
      <Text style={styles.title}>7-Day Forecast</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.day}>
              {new Date(item.dt_txt).toLocaleDateString('en', { weekday: 'short' })}
            </Text>
            <Text style={styles.date}>
              {new Date(item.dt_txt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
            </Text>
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
              style={styles.icon}
            />
            <Text style={styles.temp}>{Math.round(item.main.temp)}°</Text>
            <Text style={styles.description}>{item.weather[0].main}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingRight: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    width: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  day: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4a4a4a',
    marginBottom: 8,
  },
  icon: {
    width: 60,
    height: 60,
    marginVertical: 8,
  },
  temp: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4a4a4a',
    textAlign: 'center',
  },
  noData: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default FutureForecast;