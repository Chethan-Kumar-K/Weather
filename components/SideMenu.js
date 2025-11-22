import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
//import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75; // 75% of screen width

const SideMenu = ({ visible, onClose, onMenuItemPress, notificationsEnabled, onNotificationToggle }) => {
  const slideAnim = React.useRef(new Animated.Value(-MENU_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

const menuItems = [
  { id: 'current', icon: '🧭', title: 'Current Location', subtitle: 'Get weather at your location', type: 'item' },
  { id: 'notifications', icon: '🔔', title: 'Notifications', subtitle: 'Daily weather updates', type: 'toggle' },
  { id: 'favorites', icon: '⭐', title: 'Favorite Locations', subtitle: 'Manage saved locations', type: 'item'},
  { id: 'units', icon: '🌡️', title: 'Temperature Units', subtitle: 'Celsius / Fahrenheit', type: 'item' },
  { id: 'refresh', icon: '🔄', title: 'Refresh Weather', subtitle: 'Update current data', type: 'item' },
  { id: 'settings', icon: '⚙️', title: 'Settings', subtitle: 'App preferences', type: 'item' },
  { id: 'about', icon: 'ℹ️', title: 'About', subtitle: 'App version & info', type: 'item' },
];

  const handleItemPress = (itemId) => {
    if (itemId !== 'notifications') {
      onMenuItemPress(itemId);
      onClose();
    }
  };

  const handleNotificationToggle = async (value) => {
     if (onNotificationToggle) {
      await onNotificationToggle(value);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Overlay */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sliding Menu */}
        <Animated.View
          style={[
            styles.menuContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Weather App</Text>
              <Text style={styles.headerSubtitle}>Menu</Text>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
              {menuItems.map((item, index) => (
                <View key={item.id}>
                  {item.type === 'item' ? (
                    <TouchableOpacity
                      style={[
                        styles.menuItem,
                        index === menuItems.length - 1 && styles.lastMenuItem,
                      ]}
                      onPress={() => handleItemPress(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemIcon}>
                        <Text style={styles.iconEmoji}>{item.icon}</Text>
                      </View>
                      <View style={styles.menuItemText}>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={[
                        styles.menuItem,
                        index === menuItems.length - 1 && styles.lastMenuItem,
                      ]}
                    >
                      <View style={styles.menuItemIcon}>
                        <Text style={styles.iconEmoji}>{item.icon}</Text>
                      </View>
                      <View style={styles.menuItemText}>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                      </View>
                      <Switch
                        value={notificationsEnabled}
                        onValueChange={handleNotificationToggle}
                        trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
                        thumbColor={notificationsEnabled ? '#007AFF' : '#f4f3f4'}
                        ios_backgroundColor="#d3d3d3"
                      />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Version 1.0.0</Text>
              <Text style={styles.footerSubtext}>Made with ❤️</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#3b3f40',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    fontStyle: 'italic',
  },
  menuItems: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  iconEmoji: {
    fontSize: 24,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  chevron: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SideMenu;