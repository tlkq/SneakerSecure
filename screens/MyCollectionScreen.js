import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

const MyCollectionScreen = () => {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Function to load the user's collection
  const loadCollection = async () => {
    try {
      setLoading(true);
      const collectionData = await AsyncStorage.getItem('userCollection');
      
      if (collectionData) {
        const parsedCollection = JSON.parse(collectionData);
        console.log(`Loaded ${parsedCollection.length} sneakers from collection`);
        setCollection(parsedCollection);
      } else {
        console.log('No collection found in storage');
        setCollection([]);
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      Alert.alert('Error', 'Failed to load your collection');
    } finally {
      setLoading(false);
    }
  };

  // Debug function to view the raw collection data
  const debugViewCollection = async () => {
    try {
      const collection = await AsyncStorage.getItem('userCollection');
      if (collection) {
        const parsedCollection = JSON.parse(collection);
        console.log('Current collection contents:', JSON.stringify(parsedCollection, null, 2));
        return parsedCollection;
      } else {
        console.log('Collection is empty or not found');
        return [];
      }
    } catch (error) {
      console.error('Error debugging collection:', error);
      return [];
    }
  };

  // Clear the collection (for testing)
  const clearCollection = async () => {
    try {
      await AsyncStorage.removeItem('userCollection');
      setCollection([]);
      Alert.alert('Collection Cleared', 'Your collection has been reset');
    } catch (error) {
      console.error('Error clearing collection:', error);
    }
  };

  // Copy ID to clipboard
  const copyIdToClipboard = (id) => {
    Clipboard.setString(id);
    Alert.alert('Copied', 'ID copied to clipboard');
  };

  // Load collection when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCollection();
      debugViewCollection(); // Debug call
      return () => {}; // Cleanup if needed
    }, [])
  );

  const handleSneakerPress = (sneaker) => {
    navigation.navigate('SneakerDetail', { sneakerData: sneaker });
  };

  const removeSneaker = async (sneakerId) => {
    try {
      const updatedCollection = collection.filter(item => item.id !== sneakerId);
      await AsyncStorage.setItem('userCollection', JSON.stringify(updatedCollection));
      setCollection(updatedCollection);
      Alert.alert('Success', 'Sneaker removed from collection');
    } catch (error) {
      console.error('Error removing sneaker:', error);
      Alert.alert('Error', 'Failed to remove sneaker from collection');
    }
  };

  const renderSneakerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sneakerItem}
      onPress={() => handleSneakerPress(item)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.sneakerImage}
        resizeMode="contain"
      />
      <View style={styles.sneakerInfo}>
        <Text style={styles.sneakerName}>{item.name}</Text>
        
        {/* Unique ID display with copy function */}
        <TouchableOpacity 
          onPress={() => copyIdToClipboard(item.id)}
          style={styles.idContainer}
        >
          <Text style={styles.idLabel}>ID: </Text>
          <Text style={styles.idValue} numberOfLines={1} ellipsizeMode="middle">
            {item.id}
          </Text>
          <View style={styles.copyBadge}>
            <Text style={styles.copyText}>Copy</Text>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.sneakerDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        {/* Display manufacture number if available */}
        {item.manufactureNumber && (
          <Text style={styles.manufactureNumber}>
            {item.manufactureNumber}
          </Text>
        )}
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            Alert.alert(
              'Remove Sneaker',
              'Are you sure you want to remove this sneaker from your collection?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => removeSneaker(item.id) }
              ]
            );
          }}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Collection</Text>
        
        {/* Debug buttons - remove in production */}
        <View style={styles.debugButtons}>
          <TouchableOpacity style={styles.debugButton} onPress={loadCollection}>
            <Text style={styles.debugButtonText}>Reload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.debugButton} onPress={clearCollection}>
            <Text style={styles.debugButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />
      ) : collection.length > 0 ? (
        <FlatList
          data={collection}
          keyExtractor={(item) => item.id}
          renderItem={renderSneakerItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your collection is empty</Text>
          <Text style={styles.emptySubtext}>
            Scan sneaker QR codes to add items to your collection
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  sneakerItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sneakerImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  sneakerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  sneakerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // New ID display styles
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginVertical: 4,
    maxWidth: '100%',
  },
  idLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: 'bold',
  },
  idValue: {
    fontSize: 12,
    color: '#555',
    flex: 1,
  },
  copyBadge: {
    backgroundColor: '#2E7D32',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  copyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sneakerDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  manufactureNumber: {
    fontSize: 13,
    color: '#2E7D32',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  removeButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#C62828',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  debugButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default MyCollectionScreen;