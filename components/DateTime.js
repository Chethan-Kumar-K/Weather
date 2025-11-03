import { useEffect, useState } from 'react'
import{ View, Text, StyleSheet, Animated } from 'react-native'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WeatherMetric = ({ icon, title, value, unit }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [value]);

    return (
    <Animated.View style={[styles.metricCard, { opacity: fadeAnim }]}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <View style={styles.metricContent}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricValue}>
          {value}
          <Text style={styles.metricUnit}>{unit}</Text>
        </Text>
      </View>
    </Animated.View>
  );
};
//const WeatherItem = ({title, value, unit}) => {
//    return(
//        <View style={styles.weatherItem}>
//            <Text style={styles.weatherItemValue}>{title}</Text>
//            <Text style={styles.weatherItemValue}>{value}{unit}</Text>
//        </View>
//    )
//}

const DateTime = ({current, lat, lon, timezone, locationName}) => {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const scaleAnim = new Animated.Value(1);

    // Helper function to format sunrise/sunset times
    const formatTime = (timestamp, timezoneOffset) => {
        if (!timestamp || !timezoneOffset) return '';
            try {
            // Convert Unix timestamp to local time using timezone offset
            // timezoneOffset is in seconds from UTC
                const utcTime = new Date(timestamp * 1000);
                const localTime = new Date(utcTime.getTime() + (timezoneOffset * 1000));
                const hours = localTime.getUTCHours();
                const minutes = localTime.getUTCMinutes();
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            } catch (error) {
                console.error('Error formatting time:', error);
            return '';
        }
    };

    // Helper function to get AM/PM for sunrise/sunset
    const getAmPm = (timestamp, timezoneOffset) => {
        if (!timestamp || !timezoneOffset) return '';
        try {
            const utcTime = new Date(timestamp * 1000);
            const localTime = new Date(utcTime.getTime() + (timezoneOffset * 1000));
            const hours = localTime.getUTCHours();
            return hours >= 12 ? 'PM' : 'AM';
        } catch (error) {
            return '';
        }
    };

    useEffect(() => {

        console.log('DateTime props:', { current, lat, lon, timezone });

        const updateDateTime = () => {
       
            const time = new Date();
            const month = time.getMonth();
            const date = time.getDate();
            const day = time.getDay();
            const hours = time.getHours();
            const hoursIn12HrFormat = hours >= 13 ? hours %12 : hours === 0 ? 12 : hours;
            const minutes = time.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM'

            setTime((hoursIn12HrFormat < 10? '0'+hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10? '0'+minutes: minutes) +ampm) 
            setDate(days[day] + ', ' + date+ ' ' + months[month]) 

            if (minutes === 0) {
            Animated.sequence([
            Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

        // update time immediately and then every second
        updateDateTime();

        // update time every second
        const intervalId = setInterval(updateDateTime, 1000);
        
        // clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return(
    <View style={styles.container}>
      <View style={styles.mainCard}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{locationName || 'Current Location'}</Text>
        </View>

        <Animated.View style={[styles.timeContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.timeText}>{time}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </Animated.View>

        <View style={styles.metricsGrid}>
          <WeatherMetric icon="💧" title="Humidity" value={current?.humidity || '--'} unit="%" />
          <WeatherMetric icon="🌡️" title="Pressure" value={current?.pressure || '--'} unit=" hPa" />
          <WeatherMetric icon="🌅" title="Sunrise" value={formatTime(current?.sunrise, timezone) || '--'} unit={` ${getAmPm(current?.sunrise, timezone)}`} />
          <WeatherMetric icon="🌇" title="Sunset" value={formatTime(current?.sunset, timezone) || '--'} unit={` ${getAmPm(current?.sunset, timezone)}`} />
        </View>
      </View>

      <View style={styles.coordsCard}>
        <View style={styles.coordItem}>
          <Text style={styles.coordLabel}>Timezone</Text>
          <Text style={styles.coordValue}>
            {timezone ? `UTC${timezone >= 0 ? '+' : ''}${(timezone / 3600).toFixed(1)}` : '--'}
          </Text>
        </View>
        <View style={styles.coordDivider} />
        <View style={styles.coordItem}>
          <Text style={styles.coordLabel}>Coordinates</Text>
          <Text style={styles.coordValue}>
            {lat && lon ? `${lat.toFixed(2)}°, ${lon.toFixed(2)}°` : '--'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 20,
    paddingTop: 20, 
    paddingBottom: 10 
    },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    },
  locationContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
    },
  locationIcon: { 
    fontSize: 20, 
    marginRight: 8 
    },
  locationText: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#1a1a1a', 
    letterSpacing: 0.5 
    },
  timeContainer: { 
    marginBottom: 24 
    },
  timeText: { 
    fontSize: 56, 
    fontWeight: '800', 
    color: '#1a1a1a', 
    letterSpacing: -2, 
    marginBottom: 4 
    },
  dateText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#4a4a4a', 
    letterSpacing: 0.3 
    },
  metricsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    marginTop: 8 
    },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    },
  metricIcon: { 
    fontSize: 28, 
    marginRight: 12 
    },
  metricContent: {
    flex: 1 
    },
  metricTitle: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#5a5a5a', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 2 
    },
  metricValue: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1a1a1a' 
    },
  metricUnit: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: '#6a6a6a' 
    },
  coordsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  coordItem: { 
    flex: 1, 
    alignItems: 'center' 
    },
  coordLabel: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#5a5a5a', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 4 
    },
  coordValue: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#1a1a1a' 
    },
  coordDivider: { 
    width: 1, 
    backgroundColor: 'rgba(255, 255, 255, 0.3)', 
    marginHorizontal: 16 
    },
});

export default DateTime