import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AccountSettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>
      <Text style={styles.placeholderText}>This is a placeholder for the Account Settings screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
});

export default AccountSettingsScreen;