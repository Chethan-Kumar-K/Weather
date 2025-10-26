import { StatusBar } from 'expo-status-bar';
import {useEffect, useState} from 'react';
import { StyleSheet, Text, View, ImageBackground, Alert } from 'react-native';
import * as Location from 'expo-location';

import DateTime from './components/DateTime';
import WeatherScroll from './components/WeatherScroll';
import SearchBar from './components/SearchBar';

const API_KEY = "YOUR_API_KEY";   // Replace with your OpenWeatherMap API key
const img = require('./assets/weatherBG1.jpg');

export default function App() {
  const [data, setData ]= useState({
   current: null,
   daily: [],
   lat: null,
   lon: null,
   timezone: null
  });

  useEffect(() => {
    getCurrentLocationWeather();
  }, [])

 const getCurrentLocationWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Default to New York if permission denied
        fetchDataFromApi(40.7128, -74.0060);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      fetchDataFromApi(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
      fetchDataFromApi(40.7128, -74.0060); // Fallback to New York
    }
  };

 const searchLocationWeather = async (locationName) => {
    try {
      // Use OpenWeather Geocoding API to get coordinates from city name
      const geocodeResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData || geocodeData.length === 0) {
        Alert.alert('Location Not Found', 'Please check the city name and try again.');
        return;
      }

      const { lat, lon } = geocodeData[0];
      await fetchDataFromApi(lat, lon);
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Search Error', 'Failed to search for this location. Please try again.');
    }
  };

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
      Alert.alert('Weather Error', 'Failed to fetch weather data. Please try again.');
    }
  };
  
  return (
    <View style={styles.container}>
      <ImageBackground source={img} style={styles.Image}>
        <SearchBar onLocationSearch={searchLocationWeather}/>
        <DateTime 
        current={data.current} 
        timezone={data.timezone} 
        lat={data.lat} 
        lon={data.lon}/>
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
    justifyContent:"flex-start",
    paddingTop: 40,
  },
});
