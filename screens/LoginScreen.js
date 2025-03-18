import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');

  const handleLogin = async () => {
    //login logic

  // save username to async storage for admin check
    await AsyncStorage.setItem('username', username);

    //navigate to home screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  };

  return (
    <View style={styles.container}>
      {/*logo */}
      <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.lockBody}>
        <Text style={styles.title}>Sneaker{"\n"}Secure</Text>
      </LinearGradient>

      {/*inputs*/}
      <TextInput
        style={styles.input}
        placeholder="USERNAME"
        placeholderTextColor="black"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput style={styles.input} placeholder="PASSWORD" placeholderTextColor="black" secureTextEntry />

      {/*forgot passowrd */}
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>

      {/*log in */}
      <TouchableOpacity
        style={styles.loginButton}
        activeOpacity={0.8}
        onPress={handleLogin} //resets stack
      >
        <Text style={styles.loginText}>LOG IN</Text>
      </TouchableOpacity>

      {/*create account */}
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.signupText}>CREATE AN ACCOUNT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  lockBody: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    color: "#ffffff",
  },
  input: {
    width: "80%",
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#EAEAEA",
    borderRadius: 20,
    textAlign: "center",
    fontSize: 18,
  },
  forgotPassword: {
    color: "blue",
    marginBottom: 20,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 10,
  },
  loginText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  signupText: {
    marginTop: 20,
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#2E7D32",
  },
});
