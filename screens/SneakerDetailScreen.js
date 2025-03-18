import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  FlatList, 
  Dimensions, 
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VerifiedBadge from '../components/VerifiedBadge';
import { updateSneaker, getAllSneakers } from '../QRGen'; 

const { width: screenWidth } = Dimensions.get('window');

const SneakerDetailScreen = ({ route, navigation }) => {
  const initialSneakerData = route.params?.sneakerData || {};
  
 
  const [sneakerData, setSneakerData] = useState(initialSneakerData);
  const [gallery, setGallery] = useState(initialSneakerData?.gallery || []);
  const [scanHistory, setScanHistory] = useState(initialSneakerData?.history || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedSneaker, setEditedSneaker] = useState({...initialSneakerData});
  
  const flatListRef = useRef(null);

  //admin check
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        setIsAdmin(username === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, []);

  const addToCollection = async () => {
    try {
      //save to collection  
      const collection = await AsyncStorage.getItem('userCollection') || '[]';
      const userCollection = JSON.parse(collection);
      
      //check if already in collection
      if (!userCollection.some(item => item.id === sneakerData.id)) {
        userCollection.push({
          id: sneakerData.id,
          name: sneakerData.name,
          description: sneakerData.description,
          imageUrl: sneakerData.imageUrl,
        });
        
        await AsyncStorage.setItem('userCollection', JSON.stringify(userCollection));
        Alert.alert('Success', 'Sneaker added to your collection!');
      } else {
        Alert.alert('Already Added', 'This sneaker is already in your collection.');
      }
    } catch (error) {
      console.error('Error adding to collection', error);
      Alert.alert('Error', 'Error adding to collection. Please try again.');
    }
  };

  const handleEditSneaker = () => {
    //create a copy of the sneaker data for editing
    setEditedSneaker({
      id: sneakerData?.id || '',
      name: sneakerData?.name || '',
      description: sneakerData?.description || '',
      manufactureNumber: sneakerData?.manufactureNumber || '',
      imageUrl: sneakerData?.imageUrl || '',
      gallery: [...(sneakerData?.gallery || [])],
      history: [...(sneakerData?.history || [])]
    });
    setEditing(true);
  };

  const handleCancelEdit = () => {
    Alert.alert(
      "Cancel Editing",
      "Are you sure you want to cancel editing? All changes will be lost.",
      [
        { text: "Continue Editing", style: "cancel" },
        { text: "Discard Changes", style: "destructive", onPress: () => setEditing(false) }
      ]
    );
  };

  const handleSaveEdit = async () => {
    try {
      //validate required fields
      if (!editedSneaker.name || !editedSneaker.description) {
        Alert.alert('Validation Error', 'Name and description are required fields');
        return;
      }

      //create a complete updated sneaker object
      const updatedSneaker = {
        ...sneakerData,
        name: editedSneaker.name,
        description: editedSneaker.description,
        manufactureNumber: editedSneaker.manufactureNumber,
        imageUrl: editedSneaker.imageUrl,
        //preserve gallery and history
        gallery: sneakerData.gallery || [],
        history: sneakerData.history || []
      };

      console.log("Saving updated sneaker:", JSON.stringify(updatedSneaker));

      setSneakerData(updatedSneaker);
      setGallery(updatedSneaker.gallery);
      setScanHistory(updatedSneaker.history);

      //update the data in QRGen.js 
      const updateSuccess = await updateSneaker(updatedSneaker);
      
      if (!updateSuccess) {
        throw new Error("Failed to update sneaker data");
      }

      
      setEditing(false);
      
      
      Alert.alert('Success', 'Sneaker details updated successfully!');
      
      //refresh list
      const refreshedSneakers = await getAllSneakers();
      console.log('Successfully updated sneakers database');
      
    } catch (error) {
      console.error('Error saving edited sneaker:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  //edit ui
  const EditModal = () => (
    <Modal
      visible={editing}
      animationType="slide"
      onRequestClose={handleCancelEdit}
      transparent={false}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView>
          <Text style={styles.modalTitle}>Edit Sneaker Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editedSneaker.name}
              onChangeText={(text) => setEditedSneaker(prev => ({...prev, name: text}))}
              placeholder="Sneaker name"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, {height: 100}]}
              value={editedSneaker.description}
              onChangeText={(text) => setEditedSneaker(prev => ({...prev, description: text}))}
              placeholder="Description"
              multiline
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Manufacture Number</Text>
            <TextInput
              style={styles.input}
              value={editedSneaker.manufactureNumber}
              onChangeText={(text) => setEditedSneaker(prev => ({...prev, manufactureNumber: text}))}
              placeholder="Manufacture number"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={editedSneaker.imageUrl}
              onChangeText={(text) => setEditedSneaker(prev => ({...prev, imageUrl: text}))}
              placeholder="Image URL"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/*images gallery */}
        <View style={styles.galleryContainer}>
          <FlatList
            ref={flatListRef}
            data={gallery.length > 0 ? gallery : [sneakerData?.imageUrl]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `image-${index}`}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth
              );
              setCurrentIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.sneakerImage}
                resizeMode="contain"
              />
            )}
          />
          
          {/*pagination dots*/}
          <View style={styles.paginationContainer}>
            {(gallery.length > 0 ? gallery : [sneakerData?.imageUrl]).map((_, index) => (
              <View
                key={`dot-${index}`}
                style={[
                  styles.paginationDot,
                  currentIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/*sneaker details */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.sneakerName}>{sneakerData?.name}</Text>
            <VerifiedBadge />
          </View>
          
          <Text style={styles.manufactureNumber}>
            {sneakerData?.manufactureNumber || 'N/A'}
          </Text>
          
          <Text style={styles.description}>{sneakerData?.description}</Text>
          
          {/*ownership */}
          <Text style={styles.sectionTitle}>Ownership History</Text>
          {scanHistory && scanHistory.length > 0 ? (
            scanHistory.map((record, index) => (
              <View key={`history-${index}`} style={styles.historyItem}>
                <Text style={styles.historyName}>{record.name}</Text>
                <Text style={styles.historyDate}>{record.date}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No ownership history available</Text>
          )}
          
          {/*functions */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={addToCollection}
            >
              <Text style={styles.actionButtonText}>Add to Collection</Text>
            </TouchableOpacity>
            
            {isAdmin && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEditSneaker}
              >
                <Text style={styles.actionButtonText}>Edit Details</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      
      {}
      {editing && <EditModal />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  galleryContainer: {
    height: 300,
    width: '100%',
    marginBottom: 10,
  },
  sneakerImage: {
    width: screenWidth,
    height: 300,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    margin: 5,
  },
  activeDot: {
    backgroundColor: '#2E7D32',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailsContainer: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sneakerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  manufactureNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  historyName: {
    fontSize: 16,
    color: '#333',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  actionButtons: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#1976D2',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#C62828',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SneakerDetailScreen;