import { StatusBar } from 'expo-status-bar';
import {useEffect, useState, useCallback, useRef} from 'react';
import { StyleSheet, Text, View, ImageBackground, Alert, TouchableOpacity, ScrollView,RefreshControl} from 'react-native';
import * as Location from 'expo-location';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AppSplash from './components/SplashScreen'; // in-app splash
import DateTime from './components/DateTime';
import WeatherScroll from './components/WeatherScroll';
import SearchBar from './components/SearchBar';
import SideMenu from './components/SideMenu';
import notificationService from './services/notificationService';
//import { useTheme } from './theme';

SplashScreen.preventAutoHideAsync(); // Keep the splash screen visible while we fetch resources

const API_KEY = "YOUR_API_KEY";   // Replace with your OpenWeatherMap API key

const weatherGradients = {
  Clear: ['#1dbaf8b4', '#cd1fec68'],
  Clouds: ['#c450b877', '#49c5ee9d'],
  Rain: ['#709fc5ff', '#97c6f6ff'],
  Drizzle: ['#778899', '#B0C4DE'],
  Thunderstorm: ['#d1bfdeff', '#9370DB'],
  Snow: ['#F0F8FF', '#E6E6FA'],
  Mist: ['#E0E0E0', '#F5F5F5'],
  Fog: ['#E0E0E0', '#F5F5F5'],
  Haze: ['#E0E0E0', '#F5F5F5'],
  default: ['#87CEEB', '#FFFFFF'],
};
//const weatherBackgrounds = {
//  Clear: require('./assets/backgrounds/clear.jpg'),
//  Clouds: require('./assets/backgrounds/cloudy.jpg'),
//  Rain: require('./assets/backgrounds/rainy.jpg'),
//  Drizzle: require('./assets/backgrounds/drizzle.jpg'),
//  Thunderstorm: require('./assets/backgrounds/thunderstorm.jpg'),
//  Snow: require('./assets/backgrounds/snowy.jpg'),
//  Mist: require('./assets/backgrounds/misty.jpg'),
//  Fog: require('./assets/backgrounds/misty.jpg'),
//  Haze: require('./assets/backgrounds/misty.jpg'),
//  default: require('./assets/weatherBG1.jpg'),
//};

export default function App() {
  //const theme = useTheme();
  const [data, setData ]= useState({
   current: null,
   daily: [],
   lat: null,
   lon: null,
   timezone: null,
   cityName: null
  });
  const [appIsReady, setAppIsReady] = useState(false);
  const [gradientColors, setGradientColors] = useState(weatherGradients.default);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

// Update gradient based on weather condition
      if (currentData.weather && currentData.weather.length > 0) {
        const weatherCondition = currentData.weather[0].main;
        setGradientColors(weatherGradients[weatherCondition] || weatherGradients.default);
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

 // const onLayoutRootView = useCallback(async () => {
 //   if (appIsReady) {
 //     // Hide splash screen once layout is ready
 //     await SplashScreen.hideAsync().catch(console.warn);
 //   }
 // }, [appIsReady]);
//
 // if (!appIsReady) {
 // //  return null;
 // // show the in-app splash component while native splash is still visible
 //   return <AppSplash />;
 // }

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
  
const onRefresh = useCallback(async () => {
  setRefreshing(true);
  try {
    if (data.lat && data.lon) {
      await fetchDataFromApi(data.lat, data.lon);
    } else {
      await getCurrentLocationWeather();
    }
  } catch (error) {
    console.error('Error refreshing weather data:', error);
  } finally {
    setRefreshing(false);
  }
}, [data.lat, data.lon]);

  // AUTO HIDE SPLASH + FIX RED SCREEN
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <AppSplash />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <StatusBar style="dark" />
        
        {/* Menu Button */}
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="menu" size={28} color="#3b3f40" />
        </TouchableOpacity>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SearchBar onLocationSearch={searchLocationWeather}/>
          
          <DateTime 
            current={data.current} 
            timezone={data.timezone} 
            lat={data.lat} 
            lon={data.lon}
            locationName={data.cityName}
          />
          
          <WeatherScroll 
            weatherData={data.daily} 
            refreshing={refreshing} 
            onRefresh={onRefresh}
          />
        </ScrollView>
      </LinearGradient>

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
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  }
});
