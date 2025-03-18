import AsyncStorage from '@react-native-async-storage/async-storage';


class DatabaseHelper {
  static DB_PREFIX = 'db_collection_';
  static initialized = false;
  
  static async initDB() {
    try {

      this.initialized = true;
      console.log("Database helper initialized (using AsyncStorage fallback)");
      return true;
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
    }
  }
  
  static async getCollection() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const collectionKeys = keys.filter(key => key.startsWith(this.DB_PREFIX));
      
      if (collectionKeys.length === 0) {
        return [];
      }
      
      const items = await AsyncStorage.multiGet(collectionKeys);
      return items
        .map(([key, value]) => {
          if (!value) return null;
          try {
            return JSON.parse(value);
          } catch (e) {
            console.error("Error parsing item:", e);
            return null;
          }
        })
        .filter(item => item !== null);
    } catch (error) {
      console.error("Error getting collection:", error);
      return [];
    }
  }
  
  static async addToCollection(sneakerData) {
    try {
      if (!sneakerData || !sneakerData.id) {
        throw new Error("Invalid sneaker data");
      }
      
      const itemKey = `${this.DB_PREFIX}${sneakerData.id}`;
      const itemData = {
        id: sneakerData.id,
        name: sneakerData.name || "Unknown Sneaker",
        description: sneakerData.description || "",
        imageUrl: sneakerData.imageUrl || "",
        added_at: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(itemKey, JSON.stringify(itemData));
      console.log("Added item to collection:", itemData.name);
      return itemData.id;
    } catch (error) {
      console.error("Error adding to collection:", error);
      throw error;
    }
  }
  
  static async deleteFromCollection(id) {
    try {
      if (!id) {
        throw new Error("Invalid ID for deletion");
      }
      
      const itemKey = `${this.DB_PREFIX}${id}`;
      await AsyncStorage.removeItem(itemKey);
      console.log("Removed item from collection:", id);
      return true;
    } catch (error) {
      console.error("Error deleting from collection:", error);
      throw error;
    }
  }
  
  static async migrateFromAsyncStorage(asyncStorageData) {
    try {
      if (!asyncStorageData || !Array.isArray(asyncStorageData) || asyncStorageData.length === 0) {
        console.log("No data to migrate");
        return true;
      }
      
      console.log(`Migrating ${asyncStorageData.length} items to collection`);
      

      for (const item of asyncStorageData) {
        if (!item || !item.id) {
          console.warn("Skipping invalid item during migration");
          continue;
        }
        
        const itemKey = `${this.DB_PREFIX}${item.id}`;
        const itemData = {
          id: item.id,
          name: item.name || "Unknown Sneaker",
          description: item.description || "",
          imageUrl: item.imageUrl || "",
          added_at: item.added_at || new Date().toISOString()
        };
        
        await AsyncStorage.setItem(itemKey, JSON.stringify(itemData));
        console.log("Migrated item:", itemData.name);
      }
      
      return true;
    } catch (error) {
      console.error("Migration error:", error);
      return false;
    }
  }

  static async getAllSneakers() {
    try {
      const sneakersData = await AsyncStorage.getItem('allSneakers');
      if (!sneakersData) {
        return [];
      }
      return JSON.parse(sneakersData);
    } catch (error) {
      console.error('Error getting all sneakers:', error);
      return [];
    }
  }

  static async updateSneaker(updatedSneaker) {
    try {
      if (!updatedSneaker || !updatedSneaker.id) {
        throw new Error("Invalid sneaker data for update");
      }
      
      // Get all sneakers
      const allSneakers = await this.getAllSneakers();
      
      //update sneaker
      const updatedSneakers = allSneakers.map(sneaker => 
        sneaker.id === updatedSneaker.id ? updatedSneaker : sneaker
      );
      
      //resave to async
      await AsyncStorage.setItem('allSneakers', JSON.stringify(updatedSneakers));
      
      //if the sneaker is in MyCollection, update it there too
      const itemKey = `${this.DB_PREFIX}${updatedSneaker.id}`;
      const inCollection = await AsyncStorage.getItem(itemKey);
      
      if (inCollection) {
        const collectionItem = JSON.parse(inCollection);
        const updatedCollectionItem = {
          ...collectionItem,
          name: updatedSneaker.name,
          description: updatedSneaker.description,
          imageUrl: updatedSneaker.imageUrl,
        };
        await AsyncStorage.setItem(itemKey, JSON.stringify(updatedCollectionItem));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating sneaker:', error);
      throw error;
    }
  }
}

export default DatabaseHelper;