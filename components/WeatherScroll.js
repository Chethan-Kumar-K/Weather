import React from 'react'
import { View, ScrollView, Image, Text, StyleSheet, Dimensions, RefreshControl  } from 'react-native'
import FutureForecast from './FutureForecast'

const { width } = Dimensions.get('window');

const WeatherScroll = ({weatherData, locationName, refreshing, onRefresh}) => {
    console.log('WeatherScroll - received weatherData:', weatherData);
    console.log('WeatherScroll - weatherData type:', typeof weatherData);
    console.log('WeatherScroll - weatherData length:', weatherData ? weatherData.length : 'N/A');

// Derive a safe display name: explicit prop > API city name > fallback
    const displayLocation =
        locationName ||
        (weatherData && weatherData.city && weatherData.city.name) ||
        (Array.isArray(weatherData) && weatherData.length > 0 && weatherData[0]?.name) ||
        'Current Location';

  return (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <CurrentTempEl data={weatherData && weatherData.length > 0 ? weatherData[0] : {}}/>
      <FutureForecast weatherData={weatherData || []}/>
    </ScrollView>
  );
};

const CurrentTempEl = ({data}) =>{

    if(data && data.weather){
    const img = {uri: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`}

    const getDay = (dateString) => {
            if (!dateString) return 'Today';
            const date = new Date(dateString);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[date.getDay()];
        };

    return(
        <View style={styles.CurrentTempContainer}>
            <Image source={img} style={styles.image}/>
            <View style={styles.otherContainer}>
                <Text style={styles.day}>{getDay(data.dt_txt)}</Text>
                <Text style={styles.temp}>Temperature: {Math.round(data.main.temp)}°C</Text>
                <Text style={styles.temp}>Feels like: {Math.round(data.main.feels_like)}°C</Text>
                <Text style={styles.description}>Description: {data.weather[0].description}</Text>
            </View>
        </View>
    );
    } else {
        return(
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading weather data...</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    scrollView:{
        flex: 2,
        backgroundColor:"rgba(230, 241, 240, 0)",
        padding: 40,
    },
        contentContainer:{
        paddingBottom: 40,
    },
    locationHeader:{
        alignItems: 'center',
        marginBottom: 12,
    },
    locationText:{
        fontSize: 22,
        fontWeight: '800',
        color: 'black',
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    image:{
        width: 80,
        height: 60,
    },
    CurrentTempContainer:{
        flexDirection:"row",
        backgroundColor:"rgba(197, 212, 217, 0.37)",
        justifyContent:"center",
        alignItems:"center",
        borderRadius: 16,
        borderColor:"rgba(202, 215, 219, 0.02)",
        borderWidth: 1,
        marginBottom: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    otherContainer:{
        padding: "auto",
    },
    day:{
        fontSize: 20,
        color: "black",
        backgroundColor:"rgba(59, 63, 64, 0)",
        padding: 12,
        textAlign: "center",
        borderRadius: 16,
        fontWeight: "bold",
        marginBottom: 8,
        fontFamily: "AvenirNext-Regular",
    },
    temp:{
        fontSize: 16,
        color: "black",
        backgroundColor:"rgba(197, 212, 217, 0.01)",
    },
    description:{
        fontSize: 14,
        color: "black",
        backgroundColor:"rgba(197, 212, 217, 0.01)",
        fontStyle: "italic",
        textTransform: "capitalize",
    },
    loadingContainer:{
        backgroundColor:"rgba(197, 212, 217, 0.37)",
        justifyContent:"center",
        alignItems:"center",
        borderRadius: 16,
        padding: 40,
        marginBottom: 20,
    },
    loadingText:{
        fontSize: 16,
        color: "black",
        fontStyle: "italic",
    }
})

export default WeatherScroll
