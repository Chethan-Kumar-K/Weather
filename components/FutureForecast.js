import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions } from 'react-native';

//const { width } = Dimensions.get('window');

const FutureForecast = ({ weatherData }) => {
  if (!weatherData || weatherData.length === 0) {
    return (
      <View style={styles.noData}>
        <Text style={styles.noDataText}>Loading forecast...</Text>
      </View>
    );
  }

  const data = weatherData.slice(1);

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.day}>
        {new Date(item.dt_txt).toLocaleDateString('en', { weekday: 'short' })}
      </Text>
      <Text style={styles.date}>
        {new Date(item.dt_txt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
      </Text>
      <Image
        source={{ uri: `https://openweathermap.org/img/wn/\${item.weather[0].icon}@2x.png` }}
        style={styles.icon}
      />
      <Text style={styles.temp}>{Math.round(item.main.temp)}°</Text>
      <Text style={styles.description}>{item.weather[0].main}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>5-Day Forecast</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listContent: {
    paddingRight: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    width: 110,
    shadowColor: '#00000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  day: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fdfbfbff',
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
    color: '#ffffff',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fcfafaff',
    textAlign: 'center',
  },
  noData: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
  },
});

export default FutureForecast;