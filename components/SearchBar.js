import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

const SearchBar = ({ onLocationSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    setIsLoading(true);
    try {
      await onLocationSearch(searchText.trim());
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather data for this location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter city name (e.g., London, New York)"
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        {searchText.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.searchButton, isLoading && styles.searchButtonDisabled]} 
        onPress={handleSearch}
        disabled={isLoading}
      >
        <Text style={styles.searchButtonText}>
          {isLoading ? 'Searching...' : 'Search'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
});

export default SearchBar;