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
} from 'react-native';

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
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounce search text to avoid excessive API calls
  const debouncedSearchText = useDebounce(searchText, 500);

  // API configuration - You can use different geocoding services
  const API_CONFIGS = {
    // Option 1: OpenWeatherMap Geocoding API (Free with registration)
    openweather: {
      baseUrl: 'http://api.openweathermap.org/geo/1.0/direct',
      apiKey: '5a744117d5f6a9eeae9674a0b790ab97', // Replace with your API key
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
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setTimeout(() => setShowSuggestions(false), 100);
    });

    return () => {
      keyboardDidHideListener?.remove();
      // Cancel any pending requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSearch = async (location = searchText) => {
    const searchLocation = location.trim();
    if (!searchLocation) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      await onLocationSearch(searchLocation);
      inputRef.current?.blur();
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather data for this location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchText(suggestion.name);
    setShowSuggestions(false);
    handleSearch(suggestion.name);
  };

  const handleClear = () => {
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleTextChange = (text) => {
    setSearchText(text);
    if (text.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>📍 {item.name}</Text>
        <Text style={styles.suggestionDetails}>{item.country}</Text>
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
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Enter city name (e.g., London, New York)"
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
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
       
        <TouchableOpacity
          style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
          onPress={() => handleSearch()}
          disabled={isLoading}
        >
          <Text style={styles.searchButtonText}>
            {isLoading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* API-based Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isFetchingSuggestions) && (
        <View style={styles.suggestionsContainer}>
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
                  <Text style={styles.emptyText}>No cities found</Text>
                </View>
              )
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  clearButton: {
    padding: 5,
    marginLeft: 5,
  },
  clearText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: 'rgba(59, 63, 64, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: 'rgba(59, 63, 64, 0.4)',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginTop: 5,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionsList: {
    borderRadius: 15,
  },
  suggestionItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  suggestionContent: {
    flexDirection: 'column',
  },
  suggestionName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionDetails: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
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
    fontStyle: 'italic',
  },
});

export default SearchBar;