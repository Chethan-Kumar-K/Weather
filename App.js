import { StatusBar } from 'expo-status-bar';
import {useEffect, useState} from 'react';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import * as Location from 'expo-location';

import DateTime from './components/DateTime';
import WeatherScroll from './components/WeatherScroll';

const API_KEY = "API_KEY_HERE"; // Replace with your OpenWeatherMap API key
const img = require('./assets/weatherBG1.jpg');

export default function App() {
  const [data, setData ]= useState({});

    useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        fetchDataFromApi("40.7128", "-74.0060")
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      fetchDataFromApi(location.coords.latitude, location.coords.longitude);
    })();
  }, [])

const fetchDataFromApi = async (latitude, longitude) => {
    try {
      // Fetch current weather data
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      );
      const currentData = await currentResponse.json();
      
      // Fetch 5-day forecast (for daily data)
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastResponse.json();

      // Combine the data to match your component structure
      const combinedData = {
        lat: currentData.coord.lat,
        lon: currentData.coord.lon,
        timezone: currentData.timezone, // Note: this will be offset in seconds
        current: {
          temp: currentData.main.temp,
          humidity: currentData.main.humidity,
          pressure: currentData.main.pressure,
          sunrise: currentData.sys.sunrise,
          sunset: currentData.sys.sunset,
          weather: currentData.weather,
          wind_speed: currentData.wind.speed,
          feels_like: currentData.main.feels_like,
        },
        daily: forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5), // Get daily data (every 8th item is roughly daily)
      };

      console.log('Combined weather data:', combinedData);
      setData(combinedData);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <ImageBackground source={img} style={styles.Image}>
        <DateTime current={data.current} timezone={data.timezone} lat={data.lat} lon={data.lon}/>
        <WeatherScroll weatherData={data.daily}/>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Image:{
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
});
