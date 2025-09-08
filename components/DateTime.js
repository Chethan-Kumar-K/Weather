import { useEffect, useState } from 'react'
import{ View, Text, StyleSheet } from 'react-native'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WeatherItem = ({title, value, unit}) => {
    return(
        <View style={styles.weatherItem}>
            <Text style={styles.weatherItemValue}>{title}</Text>
            <Text style={styles.weatherItemValue}>{value}{unit}</Text>
        </View>
    )
}

const DateTime = ({current, lat, lon, timezone}) => {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')

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
            <View>
                <View>
                    <Text style={styles.heading}>{time}</Text>
                </View>
                <View>
                    <Text style={styles.subheading}>{date}</Text>
                </View>
                <View style={styles.weatherItemContainer}>
                    <WeatherItem 
                    title ="Humidity" 
                    value={current?.humidity || '--' } 
                    unit="%"
                    />
                    <WeatherItem 
                    title ="Pressure" 
                    value={current?.pressure || '--' } 
                    unit="hPa"
                    />
                    <WeatherItem 
                    title ="Sunrise" 
                    value={formatTime(current?.sunrise, timezone) || '--' } 
                    unit={` ${getAmPm(current?.sunrise, timezone)}`}
                    />
                    <WeatherItem 
                    title ="Sunset" 
                    value={formatTime(current?.sunset, timezone) || '--' } 
                    unit={` ${getAmPm(current?.sunset, timezone)}`}
                    />
                </View>
            </View>
            <View style={styles.rightAlign}>
                <Text style={styles.timezone}>
                    {timezone ? `UTC${timezone >= 0 ? '+' : ''}${(timezone / 3600).toFixed(1)}` : 'Loading...'}
                </Text>
                <Text style={styles.latlong}>
                    {lat && lon ? `${lat.toFixed(2)}°, ${lon.toFixed(2)}°` : 'Loading...'}
                </Text>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        flex: 1.5,
        flexDirection:"row",
        justifyContent:"space-between",
        marginTop: 40,
        padding: 20,
    },
    heading:{
        fontSize: 40,
        color: "black",
        fontWeight: "bold",
        fontFamily: "AvenirNext-Regular",
    },
    subheading:{
        fontSize: 22,
        color: "black",
        fontWeight: "bold",
        fontStyle: "italic",
        fontFamily: "AvenirNext-Regular",
    },
    rightAlign:{
        textAlign:"left",
        marginTop: 20,
    },
    timezone:{
        fontSize: 16,
        color:"black",
        fontWeight:"800",
        fontStyle:"italic"
    },
    latlong:{
        fontSize: 16,
        color:"black",
        fontWeight:"800",
        fontStyle:"italic"
    },
    weatherItemContainer:{
        backgroundColor:"rgba(197, 212, 217, 0.37)",
        borderRadius: 10,
        padding: 16,
        marginTop: 16,
        marginLeft: 4,
        width: "100%",
        flexDirection:"column",
        justifyContent: "space-between",
    },
    weatherItem:{
        flexDirection: "row",
        justifyContent: "space-between",
    },
    weatherItemValue:{
        color:"#1e3940db",
        fontSize: 14,
        fontWeight: "bold",
    }
})

export default DateTime