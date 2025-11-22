import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  Keyboard,
  ActivityIndicator,
  Animated,
} from 'react-native';
//import Icon from 'react-native-vector-icons/Ionicons';

// Debounce hook to prevent excessive API calls
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchBar = ({ onLocationSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [dropdownAnim] = useState(new Animated.Value(0));
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounce search text to avoid excessive API calls
  const debouncedSearchText = useDebounce(searchText, 500);

  // API configuration - You can use different geocoding services
  const API_CONFIGS = {
    // Option 1: OpenWeatherMap Geocoding API (Free with registration)
    openweather: {
      baseUrl: 'http://api.openweathermap.org/geo/1.0/direct',

      apiKey: "YOUR_API_KEY", // Replace with your API key

      buildUrl: (query, apiKey) => `${API_CONFIGS.openweather.baseUrl}?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`,
      parseResponse: (data) => data.map(item => ({
        name: `${item.name}, ${item.country}`,
        fullName: item.state ? `${item.name}, ${item.state}, ${item.country}` : `${item.name}, ${item.country}`,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.state || null,
      })),
    },
    
    // Option 2: MapBox Geocoding API (Free tier available)
    mapbox: {
      baseUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
      apiKey: 'YOUR_MAPBOX_ACCESS_TOKEN', // Replace with your access token
      buildUrl: (query, apiKey) => `${API_CONFIGS.mapbox.baseUrl}/${encodeURIComponent(query)}.json?access_token=${apiKey}&types=place&limit=5`,
      parseResponse: (data) => data.features.map(item => ({
        name: item.text,
        fullName: item.place_name,
        lat: item.center[1],
        lon: item.center[0],
        country: item.context?.find(c => c.id.startsWith('country'))?.text || '',
        state: item.context?.find(c => c.id.startsWith('region'))?.text || null,
      })),
    },

    // Option 3: Free alternative - REST Countries + Nominatim (No API key needed)
    nominatim: {
      baseUrl: 'https://nominatim.openstreetmap.org/search',
      apiKey: null,
      buildUrl: (query) => `${API_CONFIGS.nominatim.baseUrl}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&featuretype=city`,
      parseResponse: (data) => data
        .filter(item => item.class === 'place' && ['city', 'town', 'village'].includes(item.type))
        .map(item => ({
          name: item.name,
          fullName: item.display_name.split(',').slice(0, 3).join(','),
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          country: item.address?.country || '',
          state: item.address?.state || null,
        })),
    },
  };

  // Choose your preferred API (change this to switch providers)
  const currentAPI = API_CONFIGS.openweather; // Using free Nominatim API

  const handleTextChange = (text) => {
    setSearchText(text);
  };

  const handleClear = () => {
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current.focus();
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      setIsLoading(true);
      onLocationSearch(searchText.trim());
      setIsLoading(false);
      setShowSuggestions(false);
      Keyboard.dismiss();
    }
  };

  const handleSuggestionPress = (item) => {
    setSearchText(item.name);
    setShowSuggestions(false);
    onLocationSearch(item.name);
    Keyboard.dismiss();
  };

  // Fetch city suggestions from API
  const fetchCitySuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsFetchingSuggestions(true);

    try {
      const url = currentAPI.apiKey 
        ? currentAPI.buildUrl(query, currentAPI.apiKey)
        : currentAPI.buildUrl(query);

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          'User-Agent': 'WeatherApp/1.0', // Some APIs require user agent
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const parsedSuggestions = currentAPI.parseResponse(data);
      
      setSuggestions(parsedSuggestions);
      setShowSuggestions(parsedSuggestions.length > 0);
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, do nothing
        return;
      }
      console.error('Failed to fetch city suggestions:', error);
      // Fallback to empty suggestions on error
      setSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, []);

  // Fetch suggestions when debounced search text changes
  useEffect(() => {
    if (debouncedSearchText.trim()) {
      fetchCitySuggestions(debouncedSearchText.trim());
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchText, fetchCitySuggestions]);

  // Hide suggestions when keyboard is dismissed
  useEffect(() => {
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setShowSuggestions(false);
    });

    return () => keyboardHideListener.remove();
  }, []);

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showSuggestions ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showSuggestions]);

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionIconText}>📍</Text>
        <View style={styles.suggestionTextContainer}>
          <Text style={styles.suggestionName}>{item.name}</Text>
          <Text style={styles.suggestionDetails}>{item.country}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestionsHeader = () => {
    if (isFetchingSuggestions) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.loadingText}>Finding cities...</Text>
        </View>
      );
    }
    return null;
  };

  return (
   <View style={styles.container}>
     <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIconText}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Search city"
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={handleTextChange}
            onSubmitEditing={() => handleSearch()}
            onFocus={() => {
              if (searchText.length > 0 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            returnKeyType="search"
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="off"
          />
         
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
       
        <TouchableOpacity
          style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
      </View>

      {showSuggestions && (suggestions.length > 0 || isFetchingSuggestions) && (
        <Animated.View style={[styles.suggestionsContainer, { 
          opacity: dropdownAnim, 
          transform: [{ 
            translateY: dropdownAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 0]
            })
          }] 
        }]}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `${item.name}-${item.country}-${index}`}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderSuggestionsHeader}
            ListEmptyComponent={
              isFetchingSuggestions ? null : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No cities found. Try 'London' or 'New York'.</Text>
                </View>
              )
            }
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 100,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIconText: {
    marginRight: 10,
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  clearButton: {
    padding: 5,
    marginLeft: 5,
  },
  clearIcon: {
    fontSize: 20,
    color: '#666',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    backgroundColor: '#999',
  },
  arrowIcon: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 75,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  suggestionsList: {
    borderRadius: 20,
  },
  suggestionItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIconText: {
    marginRight: 12,
    fontSize: 20,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionDetails: {
    fontSize: 13,
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});

export default SearchBar;
