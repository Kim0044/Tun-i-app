import { LogBox } from 'react-native';
import React, { useEffect } from 'react';
LogBox.ignoreLogs(['new NativeEventEmitter']);
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // Import Firestore
import DeviceInfo from 'react-native-device-info'; 

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    const checkUserAndNavigate = async () => {
      const user = auth().currentUser;
      if (!user) {
        // If no user is logged in, navigate to the Welcome screen to handle login or registration
        navigation.navigate("Welcome");
        return;
      }

      // Get the device name to check if it matches Firestore
      const deviceName = await DeviceInfo.getDeviceName();
      const userRef = firestore().collection('users').doc(user.uid);

      userRef.get().then(doc => {
        if (doc.exists) {
          const userData = doc.data();
          // Check if deviceName, randomText, and username exist and match the current device
          if (userData.deviceName === deviceName && userData.randomText && userData.username) {
            navigation.navigate('HP', { userData });
          } else {
            navigation.navigate("Welcome");
          }
        } else {
          // If the document doesn't exist, navigate to the Welcome screen
          navigation.navigate("Welcome");
        }
      }).catch(error => {
        console.error("Failed to fetch user data:", error);
        // Handle errors or default to Welcome screen
        navigation.navigate("Welcome");
      });
    };

    checkUserAndNavigate();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/tuni.gif")}
        style={{ width: 500, height: 600 }}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={{
          backgroundColor: "#996633",
          borderRadius: 18,
          paddingVertical: 18,
          width: "40%",
          alignItems: "center",
          marginTop: 100,
        }}
      >
        <Text style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}>
          Let's Get Started
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff3ce",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WelcomeScreen;