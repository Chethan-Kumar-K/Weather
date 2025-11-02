import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NOTIFICATION_ENABLED_KEY = '@weather_notifications_enabled';
const NOTIFICATION_TIME_KEY = '@weather_notification_time';

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Request notification permissions
  async requestPermissions() {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('weather-updates', {
        name: 'Weather Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  }

  // Check if notifications are enabled
  async isNotificationEnabled() {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking notification status:', error);
      return false;
    }
  }

  // Enable/Disable notifications
  async setNotificationEnabled(enabled) {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled.toString());
      
      if (enabled) {
        await this.requestPermissions();
        await this.scheduleDailyNotification();
      } else {
        await this.cancelAllNotifications();
      }
      
      return true;
    } catch (error) {
      console.error('Error setting notification status:', error);
      return false;
    }
  }

  // Schedule daily weather notification
  async scheduleDailyNotification(hour = 8, minute = 0) {
    try {
      // Cancel existing notifications first
      await Notifications.cancelAllScheduledNotificationsAsync();

      const isEnabled = await this.isNotificationEnabled();
      if (!isEnabled) {
        return;
      }

      // Schedule daily notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌤️ Good Morning!',
          body: 'Check today\'s weather forecast',
          data: { type: 'daily-weather' },
          sound: true,
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true,
        },
      });

      console.log('Daily notification scheduled');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Send immediate weather notification
  async sendWeatherNotification(weatherData) {
    try {
      const isEnabled = await this.isNotificationEnabled();
      if (!isEnabled) {
        return;
      }

      const { current, cityName } = weatherData;
      
      if (!current || !current.weather) {
        return;
      }

      const temp = Math.round(current.temp);
      const description = current.weather[0].description;
      const condition = current.weather[0].main;

      let emoji = '☀️';
      switch (condition) {
        case 'Clear':
          emoji = '☀️';
          break;
        case 'Clouds':
          emoji = '☁️';
          break;
        case 'Rain':
        case 'Drizzle':
          emoji = '🌧️';
          break;
        case 'Thunderstorm':
          emoji = '⛈️';
          break;
        case 'Snow':
          emoji = '❄️';
          break;
        case 'Mist':
        case 'Fog':
          emoji = '🌫️';
          break;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${emoji} Weather Update`,
          body: `${cityName}: ${temp}°C, ${description}`,
          data: { 
            type: 'weather-update',
            cityName,
            temp,
            condition 
          },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending weather notification:', error);
    }
  }

  // Send weather alert notification
  async sendWeatherAlert(alertTitle, alertMessage) {
    try {
      const isEnabled = await this.isNotificationEnabled();
      if (!isEnabled) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⚠️ ${alertTitle}`,
          body: alertMessage,
          data: { type: 'weather-alert' },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending alert notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Set up notification listeners
  setupListeners(onNotificationReceived, onNotificationResponse) {
    this.notificationListener = Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );
  }

  // Remove listeners
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();