//import React from 'react'
//import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
//import Carousel from 'react-native-reanimated-carousel';
//
//const { width } = Dimensions.get('window');
//
//const FutureForecast = ({weatherData}) => {
//    console.log('FutureForecast - received weatherData:', weatherData);
//    console.log('FutureForecast - is weatherData an array:', Array.isArray(weatherData));
//  
//    // Safety check
//  if (!weatherData || !Array.isArray(weatherData) || weatherData.length === 0) {
//    return (
//      <View style={styles.noDataContainer}>
//        <Text style={styles.noDataText}>Loading forecast...</Text>
//      </View>
//    );
//  }
//
//return (
//    <View style={{flexDirection: 'column', marginTop: 16}}>
//      <Carousel
//        data={weatherData.slice(1)} // Skip first (current)
//        renderItem={({ item }) => <FutureForecastItem forecastItem={item} />}
//        sliderWidth={width}
//        itemWidth={110 + 12}
//        inactiveSlideOpacity={0.7}
//        inactiveSlideScale={0.9}
//        containerCustomStyle={styles.horizontalList}
//      />
//    </View>
//  );
//};
//
//const FutureForecastItem = ({forecastItem}) => {
//    if (!forecastItem || !forecastItem.weather) {
//        return <View />;
//    }
//
//    const img = {uri: `https://openweathermap.org/img/wn/${forecastItem.weather[0].icon}@2x.png`}
//        
//    // Convert dt_txt to day format
//    const getDay = (dateString) => {
//        if (!dateString) return 'N/A';
//        const date = new Date(dateString);
//        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//        return days[date.getDay()];
//    };
//
//    return(
//        <View style={styles.futureForecastItemContainer}>
//            <Text style={styles.day}>{getDay(forecastItem.dt_txt)}</Text>
//            <Image source={img} style={styles.image}/>
//            <Text style={styles.temp}>{Math.round(forecastItem.main.temp)}°C</Text>
//            <Text style={styles.description}>{forecastItem.weather[0].main}</Text>
//        </View>
//    )
//}
//
//const styles = StyleSheet.create({
//    horizontalList:{
//        paddingHorizontal: 10,
//    },
//    image:{
//        width: 50,
//        height: 50,
//    },
//    futureForecastItemContainer:{
//        width: 110,
//        marginRight: 12,
//        flexDirection:"column",
//        backgroundColor:"rgba(197, 212, 217, 0.37)",
//        justifyContent:"center",
//        alignItems:"center",
//        borderRadius: 12,
//        borderColor:"rgba(202, 215, 219, 0.02)",
//        borderWidth: 1,
//        padding: 12,
//        shadowColor: '#000',
//        shadowOffset: { width: 0, height: 2 },
//        shadowOpacity: 0.1,
//        shadowRadius: 4,
//        elevation: 2,
//    },
//    day:{
//        fontSize: 16,
//        color: "black",
//        paddingVertical: 6,
//        textAlign: "center",
//        fontWeight: "700",
//    },
//    temp:{
//        fontSize: 14,
//        color: "black",
//        textAlign: "center",
//        fontWeight: "700",
//        marginTop: 6,
//    },
//    description:{
//        fontSize: 12,
//        color: "black",
//        backgroundColor:"rgba(197, 212, 217, 0.01)",
//        textAlign: "center",
//        marginTop: 4,
//        fontStyle: "italic",
//    },
//    noDataContainer:{
//        flex: 1,
//        justifyContent: "center",
//        alignItems: "center",
//        padding: 20,
//    },
//    noDataText:{
//        fontSize: 16,
//        color: "black",
//        fontStyle: "italic",
//    },
//})
//
//export default FutureForecast
// FutureForecast.js  ←  JUST COPY-PASTE THIS ENTIRE FILE
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