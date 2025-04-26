import React, { useState } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Modal, Pressable } from "react-native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [incorrectCredentials, setIncorrectCredentials] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogin = async () => {
    if (username && password) {
      try {
        // Query Firestore to check if the provided username exists
        const usernameQuerySnapshot = await firestore().collection('users')
          .where('username', '==', username)
          .get();
  
        // Query Firestore to check if the provided email exists
        const emailQuerySnapshot = await firestore().collection('users')
          .where('email', '==', username) // Assuming username can also be an email
          .get();
  
        // Check if either username or email matches
        if (!usernameQuerySnapshot.empty || !emailQuerySnapshot.empty) {
          let userData;
          if (!usernameQuerySnapshot.empty) {
            userData = usernameQuerySnapshot.docs[0].data();
          } else {
            userData = emailQuerySnapshot.docs[0].data();
          }
          // Authenticate the user with the provided password
          const userCredential = await auth().signInWithEmailAndPassword(userData.email, password);
          const user = userCredential.user;
          navigation.navigate('HP', { userData });
        } else {
          setUsernameError(true);
          setPasswordError(true);
          setIncorrectCredentials(true);
        }
      } catch (error) {
      
        setUsernameError(true);
        setPasswordError(true);
        setIncorrectCredentials(true);
      }
    } else {
      setUsernameError(!username);
      setPasswordError(!password);
    }
  };
  
  const ModalComponent = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.centeredView} >
        <View style={styles.modalContent}>
         <Pressable
            style={[ styles.exitButton]}
            onPress={() => setModalVisible(false)}
            >
          <Text style={{ fontWeight: 'bold', fontSize: 15 }}>✖️</Text>
          </Pressable>
          <Text style={{ color: "#996633", fontSize: 18, textAlign: "center", fontFamily: 'BauhausStd-Demi' }}>
          Hi there! 😁 Please fill out the login form if you haven't signed in. Click 'Create Account' to register.
          </Text>
        </View>
      </View>
    </Modal>
  );

  
 
  const handleUsernameChange = (text) => {
    setUsername(text);
    if (text && usernameError) {
      setUsernameError(false);
    }
  };

  const handleUsernameEndEditing = () => {
    if (!username) {
      setUsernameError(false);
    }
  };

  
  const handlePasswordEndEditing = () => {
    if (!password) {
      setPasswordError(false);
    }
  };
  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text && passwordError) {
      setPasswordError(false);
    }
  };
const handleLoginButtonPress = () => {
    if (!username || !password) {
      
      setModalVisible(true);
    } else {
      
      handleLogin();
    }
  };
 
  return (
    <View style={styles.container}>

      <Image
        source={require("../../assets/anilogo.png")}
        style={{ width: 125, height: 240 }}
      />
      <Image
        source={require("../../assets/l1.png")}
        style={{ width: 200, height: 100 }}
      />
      <Text
        style={{
          fontSize: 48,
       
          color: "#3c444c",
          marginTop: 20,
          fontFamily: 'BauhausStd-Demi'
         }}
      >
        Welcome!
      </Text>

      <TextInput
        style={[
          styles.input,
          usernameError && styles.inputError,
          
          { marginBottom: usernameError ? 5 : 10 },
        ]}
        placeholder="Username"
        onChangeText={handleUsernameChange}
        onEndEditing={handleUsernameEndEditing}
      />
      {usernameError && <Text style={styles.errorText}>Wrong Credentials</Text>}
     
      <TextInput
        style={[
          styles.input,
          passwordError && styles.inputError,
          { marginBottom: passwordError ? 5 : 10 },
        ]}
        placeholder="Password"
        secureTextEntry
        onChangeText={handlePasswordChange}
        onEndEditing={handlePasswordEndEditing}
      />
      {passwordError && <Text style={styles.errorText}>Invalid password</Text>}
    
      <TouchableOpacity
        style={[
          styles.loginButton,
          (username && password) && styles.loginButtonActive,
        ]}
        onPress={handleLoginButtonPress}
      >
        <Text style={{ color: "#996633", fontSize: 16, fontFamily: 'BauhausStd-Demi' }}>Login</Text>
      </TouchableOpacity>
      
      <Text style={{ color: "#3c444c", fontSize: 16, marginLeft: 6 }}>--------------------</Text>
      <View style={styles.orContainer}>
       
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={{ color: "#996633", fontSize: 16,  fontFamily: 'BauhausStd-Demi' }}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <ModalComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7D5",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end', 
    alignItems: 'center',
    marginTop: 26,
 
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40, 
    width: '90%', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButtonActive: {
    borderColor: "#996633",
    borderWidth: 2,
  },
  exitButton: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  input: {
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    margin: 10,
    paddingLeft: 10,
    width: "80%",
    fontFamily: 'BauhausStd-Demi'
  },
  inputError: {
    borderColor: "red",
    borderWidth: 2,
  },
  loginButton: {
    padding: 9,
    borderRadius: 8,
    marginTop: 7,
    marginLeft: 6,
    marginBottom: 5,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },
  signUpButton: {
    padding: 9,
    borderRadius: 8,
    marginLeft: 6,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});

export default LoginScreen;
