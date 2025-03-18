// React Native compatible version
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values'; // Required for uuid to work properly in React Native

// Pre-defined sneakers data
const sneakers = [
  {
    name: "Air Jordan 1",
    description: "Classic basketball sneaker",
    imageUrl: "https://m.media-amazon.com/images/I/71n-Dh2kDXL._AC_SX575_.jpg",
    gallery: [
      "https://m.media-amazon.com/images/I/71pixFge+uL._AC_SX575_.jpg",
      "https://m.media-amazon.com/images/I/71n-Dh2kDXL._AC_SX575_.jpg",
      "https://m.media-amazon.com/images/I/71Nq2C31XrL._AC_SX575_.jpg"
    ],
    history: [
      { id: '1', name: 'John Doe', date: '2025-03-01' },
      { id: '2', name: 'Jane Smith', date: '2025-03-05' }
    ]
  },
  {
    name: "Nike Air Max 90",
    description: "Iconic running shoe",
    imageUrl: "https://dks.scene7.com/is/image/GolfGalaxy/19NIKMRMX90WHTGRYMNS_Gry_Wht_Smoke_Gry_Blk?qlt=70&wid=500&fmt=webp&op_sharpen=1",
    gallery: [
      "https://dks.scene7.com/is/image/GolfGalaxy/19NIKMRMX90WHTGRYMNS_Gry_Wht_Smoke_Gry_Blk?qlt=70&wid=500&fmt=webp&op_sharpen=1",
      "https://dks.scene7.com/is/image/GolfGalaxy/CN8490002_GryWhtSmokeGryBlk_SL?qlt=70&wid=500&fmt=webp&op_sharpen=1",
      "https://dks.scene7.com/is/image/GolfGalaxy/CN8490002_GryWhtSmokeGryBlk_INS?qlt=70&wid=500&fmt=webp&op_sharpen=1"
    ],
    history: [
      { id: '3', name: 'Josh Johnson', date: '2025-03-10' },
      { id: '4', name: 'Bob Brown', date: '2025-03-15' }
    ]
  },
  {
    name: "Adidas Yeezy Boost 350",
    description: "Popular collector sneaker",
    imageUrl: "https://m.media-amazon.com/images/I/41xCjNHrYHL._AC_SY695_.jpg",
    gallery: [
      "https://m.media-amazon.com/images/I/514b5as3MSL._AC_SY695_.jpg",
      "https://m.media-amazon.com/images/I/51bV6jB1RSL._AC_SY695_.jpg",
      "https://m.media-amazon.com/images/I/51bV6jB1RSL._AC_SY695_.jpg"
    ],
    history: [
      { id: '5', name: 'Jane Doe', date: '2025-03-20' },
      { id: '6', name: 'John Smith', date: '2025-03-25' }
    ]
  }
];

// Function to generate random manufacture number
function getRandomManufactureNumber() {
  const edition = Math.floor(Math.random() * 100) + 1;
  return `Limited Edition ${edition}/100 Release`;
}

// Function to prepare sneaker data with IDs and manufacture numbers
function prepareSneakerData() {
  return sneakers.map(sneaker => ({
    id: uuidv4(),
    manufactureNumber: getRandomManufactureNumber(),
    ...sneaker
  }));
}

// Initialize sneaker database in AsyncStorage
const initializeSneakerDatabase = async () => {
  try {
    // Check if sneakers are already stored
    const existingSneakers = await AsyncStorage.getItem('allSneakers');
    if (!existingSneakers) {
      // Generate prepared sneaker data with IDs and manufacture numbers
      const preparedSneakers = prepareSneakerData();
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('allSneakers', JSON.stringify(preparedSneakers));
      console.log('Initialized sneaker database with prepared data');
    } else {
      console.log('Sneaker database already exists in AsyncStorage');
    }
    return true;
  } catch (error) {
    console.error('Error initializing sneaker database:', error);
    return false;
  }
};

// Get all sneakers from storage
const getAllSneakers = async () => {
  try {
    const storedSneakers = await AsyncStorage.getItem('allSneakers');
    if (storedSneakers) {
      return JSON.parse(storedSneakers);
    }
    // If not found, initialize and then return
    await initializeSneakerDatabase();
    const freshData = await AsyncStorage.getItem('allSneakers');
    return freshData ? JSON.parse(freshData) : [];
  } catch (error) {
    console.error('Error getting sneakers:', error);
    return [];
  }
};

// Get sneaker by ID
const getSneakerById = async (id) => {
  try {
    const allSneakers = await getAllSneakers();
    return allSneakers.find(sneaker => sneaker.id === id) || null;
  } catch (error) {
    console.error('Error getting sneaker by ID:', error);
    return null;
  }
};

// Update a sneaker in the database
const updateSneaker = async (updatedSneaker) => {
  try {
    if (!updatedSneaker || !updatedSneaker.id) {
      console.error('Invalid sneaker data for update');
      return false;
    }

    // Get current sneakers
    const allSneakersStr = await AsyncStorage.getItem('allSneakers');
    if (!allSneakersStr) {
      console.error('No sneakers found in database');
      return false;
    }
    
    const allSneakers = JSON.parse(allSneakersStr);
    
    // Find and update the matching sneaker
    const updatedSneakers = allSneakers.map(sneaker => 
      sneaker.id === updatedSneaker.id ? updatedSneaker : sneaker
    );
    
    // Save back to storage
    await AsyncStorage.setItem('allSneakers', JSON.stringify(updatedSneakers));
    console.log('Sneaker updated successfully in QRGen data');
    return true;
  } catch (error) {
    console.error('Error updating sneaker:', error);
    return false;
  }
};

// Export functions for use in the app
export {
  sneakers,
  initializeSneakerDatabase,
  getAllSneakers,
  getSneakerById,
  updateSneaker,
  getRandomManufactureNumber
};