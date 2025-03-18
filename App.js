import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseHelper from './database/DatabaseHelper';
import { initializeSneakerDatabase } from './QRGen';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ForgotPassword from './screens/ForgotPassword';
import SignupScreen from './screens/SignupScreen';
import SneakerDetailScreen from './screens/SneakerDetailScreen';
import MyCollectionScreen from './screens/MyCollectionScreen';
import AccountSettingsScreen from './screens/AccountSettingsScreen';
import Testing from './screens/Testing';
import { enableScreens } from 'react-native-screens';

enableScreens();

const migrateData = async () => {
  try {
    // Check if we've already migrated
    const hasMigrated = await AsyncStorage.getItem('dbMigrationCompleted');
    if (hasMigrated === 'true') {
      console.log('Migration already completed');
      return;
    }
    
    // Get existing data from AsyncStorage
    const collectionData = await AsyncStorage.getItem('myCollection');
    if (collectionData) {
      try {
        const parsedData = JSON.parse(collectionData);
        console.log(`Found ${parsedData.length} items to migrate`);
        
        // Migrate to the new format
        const success = await DatabaseHelper.migrateFromAsyncStorage(parsedData);
        
        if (success) {
          // Mark migration as complete
          await AsyncStorage.setItem('dbMigrationCompleted', 'true');
          console.log('Migration completed successfully');
        } else {
          console.warn('Migration failed or was incomplete');
        }
      } catch (parseError) {
        console.error('Error parsing collection data:', parseError);
      }
    } else {
      console.log('No collection data found in AsyncStorage');
      // Mark as migrated anyway since there's nothing to migrate
      await AsyncStorage.setItem('dbMigrationCompleted', 'true');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
};

const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }} // Hide header for HomeScreen
      />
      <Stack.Screen name="SneakerDetail" component={SneakerDetailScreen} />
      <Stack.Screen name="MyCollection" component={MyCollectionScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="Testing" component={Testing} />
    </Stack.Navigator>
  );
};

// Loading component to show during initialization
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#FF5733" />
    <Text style={styles.loadingText}>Loading SneakerSecure...</Text>
  </View>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("Initializing database...");
        await DatabaseHelper.initDB();
        await initializeSneakerDatabase(); // Initialize sneaker database
        console.log("Database initialized, migrating data...");
        await migrateData();
        console.log("App initialization complete");
      } catch (error) {
        console.error("App initialization error:", error);
        setDbError(`Database error: ${error.message}`);
      } finally {
        // Always set loading to false, even if there was an error
        setIsLoading(false);
      }
    };
    
    initApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen if database failed to initialize
  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Database Error</Text>
        <Text style={styles.errorMessage}>{dbError}</Text>
        <Text style={styles.errorHint}>
          Try restarting the app. If the problem persists, contact support.
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <MainStackNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF5733',
    marginBottom: 10
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20
  },
  errorHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
});

export default App;