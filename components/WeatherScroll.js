import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import FutureForecast from './FutureForecast';

const { width } = Dimensions.get('window');

const WeatherScroll = ({ weatherData }) => {
  return (
    <View style={styles.container}>
      <CurrentTempEl data={weatherData && weatherData.length > 0 ? weatherData[0] : {}} />
      <FutureForecast weatherData={weatherData || []} />
    </View>
  );
};

const CurrentTempEl = ({ data }) => {
  if (data && data.weather) {
    const img = { uri: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png` };

    const getDay = (dateString) => {
      if (!dateString) return 'Today';
      const date = new Date(dateString);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    };

    return (
      <View style={styles.currentTempContainer}>
        <View style={styles.weatherHeader}>
          <Image source={img} style={styles.weatherImage} />
          <View style={styles.tempContainer}>
            <Text style={styles.mainTemp}>{Math.round(data.main.temp)}°</Text>
            <Text style={styles.tempUnit}>C</Text>
          </View>
        </View>
        
        <View style={styles.weatherDetails}>
          <Text style={styles.dayText}>{getDay(data.dt_txt)}</Text>
          <Text style={styles.descriptionText}>{data.weather[0].description}</Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Feels like</Text>
              <Text style={styles.detailValue}>{Math.round(data.main.feels_like)}°C</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>High / Low</Text>
              <Text style={styles.detailValue}>
                {Math.round(data.main.temp_max)}° / {Math.round(data.main.temp_min)}°
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  currentTempContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  weatherImage: {
    width: 120,
    height: 120,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainTemp: {
    fontSize: 72,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -3,
  },
  tempUnit: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4a4a4aff',
    marginTop: 8,
  },
  weatherDetails: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 18,
    color: '#4a4a4a',
    textTransform: 'capitalize',
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c2a2aff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  detailDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 16,
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontStyle: 'italic',
  },
});

export default WeatherScroll;
