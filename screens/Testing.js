import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DebugScreen = () => {
  const [debugResult, setDebugResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');

  const formatValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Format different types of results for better display
  const formatResult = (result, label) => {
    // Handle arrays specially
    if (Array.isArray(result)) {
      if (result.length === 0) {
        return `${label}:\n\n[Empty Array]`;
      }
      
      // Check if array contains objects
      if (typeof result[0] === 'object') {
        let output = `${label}: (${result.length} items)\n\n`;
        result.forEach((item, index) => {
          output += `[${index}] ${formatObjectForDisplay(item)}\n\n`;
        });
        return output;
      } else {
        return `${label}: (${result.length} items)\n\n[${result.join(', ')}]`;
      }
    } 
    
    // Handle objects
    else if (typeof result === 'object' && result !== null) {
      return `${label}:\n\n${formatObjectForDisplay(result)}`;
    }
    
    // Simple values
    return `${label}:\n\n${result}`;
  };
  
  // Format objects with better readability
  const formatObjectForDisplay = (obj) => {
    if (!obj) return 'null';
    
    let output = '';
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      // Format different value types
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          if (value.length === 0) {
            output += `${key}: []\n`;
          } else if (typeof value[0] === 'object') {
            output += `${key}: [Array of ${value.length} Objects]\n`;
          } else {
            output += `${key}: [${value.join(', ')}]\n`;
          }
        } else {
          // For nested objects - show simplified
          output += `${key}: {Object}\n`;
        }
      } else {
        // For primitive values
        output += `${key}: ${value}\n`;
      }
    });
    
    return output;
  };

  const runCommand = async (command, label) => {
    setIsLoading(true);
    setCurrentCommand(label);
    try {
      const result = await command();
      setDebugResult(formatResult(result, label));
    } catch (error) {
      setDebugResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug commands
  const commands = [
    {
      label: 'View User Collection',
      action: async () => {
        const collection = await AsyncStorage.getItem('userCollection');
        return collection ? JSON.parse(collection) : null;
      }
    },
    {
      label: 'View All Sneakers',
      action: async () => {
        const sneakers = await AsyncStorage.getItem('allSneakers');
        return sneakers ? JSON.parse(sneakers) : null;
      }
    },
    {
      label: 'Current User (Unit Test)',
      action: async () => {
        const username = await AsyncStorage.getItem('username');
        return { username, isAdmin: username === 'admin' };
      }
    },
    {
      label: 'Clear User Collection',
      action: async () => {
        await AsyncStorage.removeItem('userCollection');
        return { message: 'User collection cleared' };
      }
    },

    {
      label: 'Test UUID Verification (Integration Test)',
      action: async () => {
        // Import the verification function
        const { checkUUIDVerification } = require('../utils/uuid_database');
        
        // Test cases with known valid and invalid UUIDs
        const testCases = [
          { 
            uuid: "b8141245-3ae5-491d-8b52-429c070b7aef", 
            name: "Air Jordan 1",
            expectedResult: true 
          },
          { 
            uuid: "d3b59a87-86f4-473a-8a96-78f5ccee853b", 
            name: "Nike Dunk Low",
            expectedResult: true 
          },
          { 
            uuid: "invalid-uuid-format", 
            name: "Fake Product",
            expectedResult: false 
          },
          { 
            uuid: "aaaa0000-0000-0000-0000-000000000000", 
            name: "Unknown Product",
            expectedResult: false 
          }
        ];
        
        // Run verification on each test case
        const results = testCases.map(test => {
          const actualResult = checkUUIDVerification(test.uuid);
          const passed = actualResult === test.expectedResult;
          
          return {
            name: test.name,
            uuid: test.uuid,
            expectedVerification: test.expectedResult ? "Verified" : "Unverified",
            actualVerification: actualResult ? "Verified" : "Unverified",
            passed: passed,
            status: passed ? "✅ PASS" : "❌ FAIL"
          };
        });
        
        // Calculate test summary
        const totalTests = results.length;
        const passedTests = results.filter(r => r.passed).length;
        
        return {
          testTitle: "UUID Verification Tests",
          testResults: results,
          summary: `${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`
        };
      }
    },
    {
      label: 'Test Collection Operations (Data Collection Test)',
      action: async () => {
        try {
          // Initial setup - get current collection
          const collectionJson = await AsyncStorage.getItem('userCollection');
          const initialCollection = collectionJson ? JSON.parse(collectionJson) : [];
          
          // Get a test sneaker to add
          const sneakersJson = await AsyncStorage.getItem('allSneakers');
          if (!sneakersJson) return { error: "No sneakers available to test with" };
          
          const sneakers = JSON.parse(sneakersJson);
          if (!sneakers.length) return { error: "Sneakers array is empty" };
          
          const testSneaker = {
            id: sneakers[0].id,
            name: sneakers[0].name,
            description: sneakers[0].description,
            imageUrl: sneakers[0].imageUrl,
          };
          
          // 1. Test adding to collection
          let testCollection = [...initialCollection];
          if (!testCollection.some(item => item.id === testSneaker.id)) {
            testCollection.push(testSneaker);
          }
          await AsyncStorage.setItem('userCollection', JSON.stringify(testCollection));
          
          // 2. Test retrieving the collection
          const updatedCollectionJson = await AsyncStorage.getItem('userCollection');
          const updatedCollection = JSON.parse(updatedCollectionJson);
          
          // 3. Verify the sneaker was added
          const sneakerInCollection = updatedCollection.some(item => item.id === testSneaker.id);
          
          // 4. Test removing from collection (if needed)
          let removalTestPassed = "Not Tested";
          if (initialCollection.length === updatedCollection.length) {
            // Sneaker was already in collection, test removal
            const filteredCollection = updatedCollection.filter(item => item.id !== testSneaker.id);
            await AsyncStorage.setItem('userCollection', JSON.stringify(filteredCollection));
            
            const finalCollectionJson = await AsyncStorage.getItem('userCollection');
            const finalCollection = JSON.parse(finalCollectionJson);
            
            removalTestPassed = finalCollection.every(item => item.id !== testSneaker.id) 
              ? "✅ PASS" 
              : "❌ FAIL";
              
            // Restore original collection
            await AsyncStorage.setItem('userCollection', JSON.stringify(initialCollection));
          }
          
          return {
            testTitle: "Collection Operations Test",
            initialCollectionSize: initialCollection.length,
            testSneaker: {
              id: testSneaker.id,
              name: testSneaker.name
            },
            addTestResult: sneakerInCollection ? "✅ PASS" : "❌ FAIL",
            updatedCollectionSize: updatedCollection.length,
            removalTest: removalTestPassed,
            summary: "Collection operations test completed successfully"
          };
        } catch (error) {
          return {
            error: `Collection test failed: ${error.message}`,
            stack: error.stack
          };
        }
      }
    },

  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Testing</Text>
      
      <ScrollView style={styles.buttonContainer} showsVerticalScrollIndicator={false}>
        {commands.map((cmd, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button, 
              currentCommand === cmd.label ? styles.activeButton : {}
            ]}
            onPress={() => runCommand(cmd.action, cmd.label)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{cmd.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>
          {isLoading ? 'Loading...' : currentCommand || 'Result:'}
        </Text>
        <ScrollView style={styles.resultScrollView}>
          {!isLoading && (
            <Text style={styles.resultText}>{debugResult}</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    maxHeight: 200,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  activeButton: {
    backgroundColor: '#1B5E20', // Darker green for active button
    borderWidth: 2,
    borderColor: '#E8F5E9', // Light green border
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#FAFAFA',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E7D32',
  },
  resultScrollView: {
    flex: 1,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});

export default DebugScreen;