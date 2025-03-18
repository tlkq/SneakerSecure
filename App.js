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
 
    const hasMigrated = await AsyncStorage.getItem('dbMigrationCompleted');
    if (hasMigrated === 'true') {
      console.log('Migration already completed');
      return;
    }
    

    const collectionData = await AsyncStorage.getItem('myCollection');
    if (collectionData) {
      try {
        const parsedData = JSON.parse(collectionData);
        console.log(`Found ${parsedData.length} items to migrate`);
        

        const success = await DatabaseHelper.migrateFromAsyncStorage(parsedData);
        
        if (success) {

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
        options={{ headerShown: false }} 
      />
      <Stack.Screen name="SneakerDetail" component={SneakerDetailScreen} />
      <Stack.Screen name="MyCollection" component={MyCollectionScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="Testing" component={Testing} />
    </Stack.Navigator>
  );
};


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
        await initializeSneakerDatabase(); 
        console.log("Database initialized, migrating data...");
        await migrateData();
        console.log("App initialization complete");
      } catch (error) {
        console.error("App initialization error:", error);
        setDbError(`Database error: ${error.message}`);
      } finally {
        
        setIsLoading(false);
      }
    };
    
    initApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }


  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Database Error</Text>
        <Text style={styles.errorMessage}>{dbError}</Text>
        <Text style={styles.errorHint}>
          Try restarting the app.
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