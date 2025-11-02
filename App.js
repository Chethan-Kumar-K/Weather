import { StatusBar } from 'expo-status-bar';
import {useEffect, useState, useCallback, useRef} from 'react';
import { StyleSheet, Text, View, ImageBackground, Alert, TouchableOpacity} from 'react-native';
import * as Location from 'expo-location';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

import AppSplash from './components/SplashScreen'; // in-app splash
import DateTime from './components/DateTime';
import WeatherScroll from './components/WeatherScroll';
import SearchBar from './components/SearchBar';
import SideMenu from './components/SideMenu';
import notificationService from './services/notificationService';

SplashScreen.preventAutoHideAsync(); // Keep the splash screen visible while we fetch resources

const API_KEY = "YOUR_API_KEY";   // Replace with your OpenWeatherMap API key

const weatherBackgrounds = {
  Clear: require('./assets/backgrounds/clear.jpg'),
  Clouds: require('./assets/backgrounds/cloudy.jpg'),
  Rain: require('./assets/backgrounds/rainy.jpg'),
  Drizzle: require('./assets/backgrounds/drizzle.jpg'),
  Thunderstorm: require('./assets/backgrounds/thunderstorm.jpg'),
  Snow: require('./assets/backgrounds/snowy.jpg'),
  Mist: require('./assets/backgrounds/misty.jpg'),
  Fog: require('./assets/backgrounds/misty.jpg'),
  Haze: require('./assets/backgrounds/misty.jpg'),
  default: require('./assets/weatherBG1.jpg'),
};

export default function App() {
  const [data, setData ]= useState({
   current: null,
   daily: [],
   lat: null,
   lon: null,
   timezone: null,
   cityName: null
  });
  const [appIsReady, setAppIsReady] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(weatherBackgrounds.default);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const notificationListener = useRef();
  const responseListener = useRef();

  // Initialize notifications on app load
  useEffect(() => {
    // Check notification status
    const checkNotificationStatus = async () => {
      try {
        const enabled = await notificationService.isNotificationEnabled();
        setNotificationsEnabled(enabled);
      } catch (error) {
        console.error('Error checking notification status:', error);
        setNotificationsEnabled(false);
      }
    };

    checkNotificationStatus();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap - could navigate to weather details
    });

    return () => {
  if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);;

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
        cityName: currentData.name,
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

      // Update background based on weather condition
      if (currentData.weather && currentData.weather.length > 0) {
        const weatherCondition = currentData.weather[0].main;
        const newBackground = weatherBackgrounds[weatherCondition] || weatherBackgrounds.default;
        setBackgroundImage(newBackground);
        console.log('Weather condition:', weatherCondition);
      }

      return true;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      Alert.alert('Weather Error', 'Failed to fetch weather data. Please try again.');
      return false;
    }
  };

 const getCurrentLocationWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied, using default location');
        return await fetchDataFromApi(40.7128, -74.0060); // New York coordinates
      }

      const location = await Location.getCurrentPositionAsync({});
      return await fetchDataFromApi(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      return await fetchDataFromApi(40.7128, -74.0060); // Fallback to New York
    }
  };

    useEffect(() => {
      async function prepare() {
      try {
        // Initialize notifications check first
        try {
          const enabled = await notificationService.isNotificationEnabled();
          setNotificationsEnabled(enabled);
        } catch (error) {
          console.error('Error initializing notifications:', error);
          setNotificationsEnabled(false);
        }
        
        // Then get weather
        await getCurrentLocationWeather();
      } catch (error) {
        console.warn('Error during initialization:', error);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide splash screen once layout is ready
      await SplashScreen.hideAsync().catch(console.warn);
    }
  }, [appIsReady]);

  if (!appIsReady) {
  //  return null;
  // show the in-app splash component while native splash is still visible
    return <AppSplash />;
  }

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

      const { lat, lon, } = geocodeData[0];
      await fetchDataFromApi(lat, lon);
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Search Error', 'Failed to search for this location. Please try again.');
    }
  };

  const handleNotificationToggle = async (value) => {
    try {
      const success = await notificationService.setNotificationEnabled(value);
      
      if (success) {
        setNotificationsEnabled(value);
        
        if (value) {
          Alert.alert(
            'Notifications Enabled',
            'You will receive daily weather updates at 8:00 AM',
            [{ text: 'OK' }]
          );
          
          // Send a test notification with current weather
          if (data.current) {
            await notificationService.sendWeatherNotification(data);
          }
        } else {
          Alert.alert(
            'Notifications Disabled',
            'You will no longer receive weather updates',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleMenuItemPress = (itemId) => {
    switch (itemId) {
      case 'current':
        getCurrentLocationWeather();
        Alert.alert('Location', 'Getting weather for your current location...');
        break;
      case 'favorites':
        Alert.alert('Favorites', 'Favorite locations feature coming soon!');
        break;
      case 'units':
        Alert.alert('Units', 'Temperature unit switching coming soon!');
        break;
      case 'refresh':
        if (data.lat && data.lon) {
          fetchDataFromApi(data.lat, data.lon);
          Alert.alert('Refresh', 'Weather data updated!');
        } else {
          getCurrentLocationWeather();
        }
        break;
      case 'settings':
        Alert.alert('Settings', 'Settings page coming soon!');
        break;
      case 'about':
        Alert.alert(
          'About Weather App',
          'A beautiful weather application built with React Native and Expo.\n\nVersion 1.0.0\n\nData provided by OpenWeatherMap API'
        );
        break;
      default:
        break;
    }
  };
  
  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <ImageBackground source={backgroundImage} style={styles.Image}>
        {/* Menu Button */}
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>

        <SearchBar onLocationSearch={searchLocationWeather}/>
        <DateTime 
        current={data.current} 
        timezone={data.timezone} 
        lat={data.lat} 
        lon={data.lon}
        locationName={data.cityName}/>
        <WeatherScroll weatherData={data.daily}/>
      </ImageBackground>
            {/* Side Menu */}
      <SideMenu 
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onMenuItemPress={handleMenuItemPress}
        notificationsEnabled={notificationsEnabled}
        onNotificationToggle={handleNotificationToggle}
      />
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
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#3b3f40',
    borderRadius: 2,
  },
});
