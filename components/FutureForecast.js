import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

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
<View style={{ height: 160, marginTop: 20 }}>
      <Carousel
        width={110}
        height={140}
        data={data}
        loop={true}
        mode="parallax"
        modeConfig={{ parallaxScrollingScale: 0.9, parallaxScrollingOffset: 50 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.day}>
              {new Date(item.dt_txt).toLocaleDateString('en', { weekday: 'short' })}
            </Text>
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
              style={styles.icon}
            />
            <Text style={styles.temp}>
                {Math.round(item.main.temp)}°
                <Text style={{ fontSize: 12 }}>°C</Text>
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(197, 212, 217, 0.37)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  day: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#000' 
  },
  icon: { 
    width: 50, 
    height: 50, 
    marginVertical: 6
  },
  temp: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#000' 
  },
  noData: { 
    padding: 20 
    },
  noDataText: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center' 
  },
});

export default FutureForecast;