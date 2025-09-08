import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'

const FutureForecast = ({weatherData}) => {
    console.log('FutureForecast - received weatherData:', weatherData);
    console.log('FutureForecast - is weatherData an array:', Array.isArray(weatherData));
  
    // Safety check
  if (!weatherData || !Array.isArray(weatherData) || weatherData.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>Loading forecast...</Text>
      </View>
    );
  }

return (
    <View style={{flexDirection: 'column', marginTop: 16}}>
            {
                weatherData && weatherData.length > 0 ?
                weatherData.map((data, idx) => (
                    idx !== 0 && <FutureForecastItem key={idx} forecastItem={data}/>
                ))
                :
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No forecast data available</Text>
                </View>
            }
        </View>
  )
}

const FutureForecastItem = ({forecastItem}) => {
    if (!forecastItem || !forecastItem.weather) {
        return <View />;
    }

    const img = {uri: `https://openweathermap.org/img/wn/${forecastItem.weather[0].icon}@2x.png`}
        
    // Convert dt_txt to day format
    const getDay = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    };

    return(
        <View style={styles.futureForecastItemContainer}>
            <Text style={styles.day}>{getDay(forecastItem.dt_txt)}</Text>
            <Image source={img} style={styles.image}/>
            <Text style={styles.temp}>{Math.round(forecastItem.main.temp)}°C</Text>
            <Text style={styles.description}>{forecastItem.weather[0].main}</Text>

        </View>
    )
}

const styles = StyleSheet.create({
    image:{
        width: 50,
        height: 50,
    },
    futureForecastItemContainer:{
        flexDirection:"row",
        backgroundColor:"rgba(197, 212, 217, 0.37)",
        justifyContent:"column",
        alignItems:"center",
        borderRadius: 16,
        borderColor:"rgba(202, 215, 219, 0.02)",
        borderWidth: 1,
        marginBottom: 20,
        padding: 20,
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
        textAlign: "center",
        fontWeight: "bold",
        marginTop: 8,
    },
    description:{
        fontSize: 12,
        color: "black",
        backgroundColor:"rgba(197, 212, 217, 0.01)",
        textAlign: "center",
        marginTop: 4,
        fontStyle: "italic",
    },
    noDataContainer:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    noDataText:{
        fontSize: 16,
        color: "black",
        fontStyle: "italic",
    },
})

export default FutureForecast
