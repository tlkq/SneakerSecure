import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Button,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [menuOpen] = useState(new Animated.Value(-250)); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
          setIsAdmin(storedUsername === 'admin');
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUsername();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    const sneakerData = JSON.parse(data);
    navigation.navigate('SneakerDetail', { sneakerData });
  };

  const toggleMenu = () => {
    if (!isMenuOpen) {
      Animated.timing(menuOpen, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsMenuOpen(true);
      });
    } else {
      Animated.timing(menuOpen, {
        toValue: -250,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsMenuOpen(false);
      });
    }
  };

  const handleLogout = async () => {
    try {
      toggleMenu();
      await AsyncStorage.removeItem('username');
      
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }]
        });
      }, 500);
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Error', 'There was a problem logging out. Please try again.');
    }
  };

  const handlePanGesture = (event) => {
    if (event.nativeEvent.translationX < -50 && isMenuOpen) {
      toggleMenu();
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'white' }}>
      <PanGestureHandler onGestureEvent={handlePanGesture}>
        <View style={styles.container}>
          <Text style={styles.logoText}>Sneaker Secure</Text>

          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            >
              {scanned && (
                <TouchableOpacity onPress={() => setScanned(false)}>
                  <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
                </TouchableOpacity>
              )}
            </CameraView>
          </View>

          <TouchableOpacity style={styles.cameraButton} onPress={() => setScanned(false)}>
            <Icon name="camera-alt" size={30} color="#fff" />
          </TouchableOpacity>

          {/* Simple admin indicator at the bottom */}
          {isAdmin && (
            <View style={styles.adminBanner}>
              <Text style={styles.adminText}>Admin Mode</Text>
            </View>
          )}

          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <Text style={styles.toggleButtonText}>☰</Text>
          </TouchableOpacity>

          <Animated.View style={[styles.menu, { left: menuOpen }]}>
            <Text style={styles.menuHeader}>Menu</Text>
            
            {/* Simplified username display */}
            <View style={styles.userSection}>
              <Text style={styles.usernameText}>
                {username || 'Guest'}
              </Text>
            </View>
            
            <TouchableOpacity onPress={() => {
              toggleMenu();
              navigation.navigate('MyCollection');
            }}>
              <Text style={styles.menuItem}>My Collection</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              toggleMenu();
              navigation.navigate('AccountSettings');
            }}>
              <Text style={styles.menuItem}>Account Settings</Text>
            </TouchableOpacity>
            
            {/* Debug Storage - only visible to admin users */}
            {isAdmin && (
              <TouchableOpacity onPress={() => {
                toggleMenu();
                navigation.navigate('Testing');
              }}>
                <Text style={styles.menuItem}>Testing</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
          
          {isMenuOpen && (
            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={toggleMenu}
            />
          )}
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'white',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#2E7D32',
  },
  toggleButtonText: {
    fontSize: 24,
    color: "#fff",
  },
  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 15,
    backgroundColor: "#2E7D32",
    borderRadius: 10,
  },
  menu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#2E7D32",
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  menuHeader: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
    color: '#fff',
  },
  userSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    marginBottom: 10,
  },
  usernameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItem: {
    fontSize: 16,
    paddingVertical: 10,
    color: '#fff',
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    width: '100%',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 5,
  },
  cameraContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  camera: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  scanAgainText: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    marginTop: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  cameraButton: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Simplified admin banner
  adminBanner: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#2E7D32',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  adminText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default HomeScreen;
