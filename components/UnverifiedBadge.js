import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UnverifiedBadge = () => {
  return (
    <View style={styles.container}>
      <Icon name="dangerous" size={16} color="#C62828" />
      <Text style={styles.text}>Unverified</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFCDD2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C62828',
  },
  text: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default UnverifiedBadge;