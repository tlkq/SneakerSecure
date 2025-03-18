import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VerifiedBadge = () => {
  return (
    <View style={styles.badgeContainer}>
      <Text style={styles.badgeText}>✔</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: 'green',
    borderRadius: 10,
    padding: 5,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default VerifiedBadge;