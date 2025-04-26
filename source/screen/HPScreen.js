



import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Pressable, Image } from 'react-native';
import Header from '../components/Header';

import firestore from '@react-native-firebase/firestore'; 
import auth from '@react-native-firebase/auth';

const HPScreen = ({ navigation, route }) => {
  const { userData } = route.params || { userData: { username: 'Guest' } };

  const scrollViewRef = useRef();
  const [modalVisible, setModalVisible] = useState(true);
  const [introModalVisible, setIntroModalVisible] = useState(true);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [userScores, setUserScores] = useState({});
  const [greeting, setGreeting] = useState('Hello'); // default greeting


  
  useEffect(() => {
    const checkUserAndFetchScores = () => {
      const user = auth().currentUser;
      if (!user) return;
  
      const userRef = firestore().collection('users').doc(user.email);
      // Set up the real-time listener
      const unsubscribe = userRef.onSnapshot(doc => {
        let greetingMessage = 'Hello'; // Default message
        if (doc.exists) {
          const userData = doc.data();
          greetingMessage = 'Welcome back'; // User exists
          // You might want to do something with userData, like checking level
  
          // Fetch user scores dynamically and update state
          const newUserScores = {};
          for (let i = 7; i <= 40; i++) {
            const userEmailWithLevel = `${user.email}level${i}`;
            firestore().collection('scores').doc(userEmailWithLevel).get().then(scoreDoc => {
              newUserScores[i] = scoreDoc.exists; // Store whether data exists for this level
              setUserScores(prevScores => ({ ...prevScores, ...newUserScores })); // Update the state progressively
            });
          }
        } else {
          userRef.set({ email: user.email, level: 0 }); // Set new user with level 0
        }
        // Update greeting state
        setGreeting(greetingMessage);
      });
  
      return () => unsubscribe(); // Clean up the listener
    };
  
    checkUserAndFetchScores();
  }, []);



  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;
  
    const newUserScores = {};
    const scoreRefs = []; // To hold references to the unsubscribe functions
  
    // Set up listeners for each level
    for (let i = 11; i <= 44; i++) {
      const userEmailWithLevel = `${user.email}level${i}`;
      const scoreRef = firestore().collection('scores').doc(userEmailWithLevel);
      
      const unsubscribe = scoreRef.onSnapshot(scoreDoc => {
        newUserScores[i] = scoreDoc.exists; // Store whether data exists for this level
        setUserScores(prevScores => ({ ...prevScores, [i]: scoreDoc.exists })); // Update the state progressively
      });
  
      scoreRefs.push(unsubscribe); // Store the unsubscribe function for cleanup
    }
  
    // Cleanup function to unsubscribe from all score document listeners
    return () => scoreRefs.forEach(unsubscribe => unsubscribe());
  }, []);
  
  
  
  const handleRewardGo = async () => {
    try {
      const user = auth().currentUser;
      const userUID = user ? user.uid : null;
      if (!userUID) return;
  
      const userRef = firestore().collection('users').doc(userUID);
      await firestore().runTransaction(async (transaction) => {
        const doc = await transaction.get(userRef);
        if (!doc.exists) {
          throw new Error('User document does not exist');
        }
  
        const userData = doc.data();
        const newScore = (userData.score || 0) + 10; // Increment score by 10
        transaction.update(userRef, { score: newScore, daily: 0 }); // Update score and reset daily
      });
  
      setRewardModalVisible(false); // Close the reward modal
    } catch (error) {
      console.error('Error updating user score:', error);
    }
  };

  const handleIntroClose = async () => {
    setIntroModalVisible(false);
  
    const user = auth().currentUser;
    const userUID = user ? user.uid : null;
    if (!userUID) return;
  
    const userRef = firestore().collection('users').doc(userUID);
    const userDoc = await userRef.get();
  
    if (userDoc.exists) {
      const userData = userDoc.data();
      const lastChecked = userData.lastChecked ? userData.lastChecked.toDate() : null;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];  // Get current date in YYYY-MM-DD format
  
      if (!lastChecked || lastChecked.toISOString().split('T')[0] !== todayStr) {
        // Update lastChecked and reset daily if the day has changed
        await userRef.update({
          daily: 1,
          lastChecked: firestore.Timestamp.fromDate(new Date())  // Update the last checked date to now
        });
        console.log('Daily reset to 1 and lastChecked updated.');
      }
  
      // Regardless of date change, decide whether to show reward modal
      if (userData.daily === 1) {
        setRewardModalVisible(true); // Show reward modal if daily is already 1
      }
    } else {
      // Optionally handle the case where the document doesn't exist
      console.log("No user document exists");
    }
  };
  
  

  // const handleIntroClose = async () => {
  //   setIntroModalVisible(false);
  
  //   const user = auth().currentUser;
  //   const userUID = user ? user.uid : null;
  //   if (!userUID) return;
  
  //   const userRef = firestore().collection('users').doc(userUID);
  //   const userDoc = await userRef.get();
  
  //   if (userDoc.exists) {
  //     const userData = userDoc.data();
  //     if (userData.daily === 0) {
      
  //       setTimeout(() => {
  //         userRef.update({ daily: 1 }) 
  //           .then(() => {
  //             console.log('Daily updated after 10 seconds');
  //           })
  //           .catch((error) => {
  //             console.error('Error updating daily:', error);
  //           });
  //       }, 10000); 
  //     }
  //     if (userData.daily === 1) {
  //       setRewardModalVisible(true); 
  //     }
  //   } else {
    
  //     console.log("No user document exists");
  //   }
  // };
  
  
  const handleButtonPress = (level) => {
    // Handle button press based on level
    switch(level) {
      case 11:
        navigation.navigate('Section');
        break;
      case 14:
        navigation.navigate('Numbers');
        break;
      case 20:
        navigation.navigate('Directions');
        break;
      case 26:
        navigation.navigate('Emotions');
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Header />
      <Modal
        animationType="slide"
        transparent={true}
        visible={introModalVisible}
        onRequestClose={() => {
          setIntroModalVisible(!introModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Image
              source={require("../../assets/anilogo.png")}
              style={{ width: 38, height: 68 }}
            />
            <Text style={styles.greetingText}>{greeting}, {userData.username}!</Text>
            <Text style={styles.modalText}>Are you ready to start learning a new dialect?</Text>
            <Pressable
              style={styles.buttonClose}
              onPress={handleIntroClose}
            >
              <Text style={styles.textStyle}>Got it!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={rewardModalVisible}
        onRequestClose={() => {
          setRewardModalVisible(!rewardModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Image
              source={require("../../assets/anilogo.png")}
              style={{ width: 38, height: 68 }}
            />
            <Text style={styles.greetingText}>Login everyday to receive rewards!</Text>
            <Image
                    source={require('../../assets/coin.png')}
                    style={styles.coinImage}
                /> 
            <Text style={styles.modalText}>10 coins</Text>
            <Pressable
  style={styles.buttonClose}
  onPress={() => {
    handleRewardGo(); // Call handleRewardGo function
    setRewardModalVisible(false); // Hide the modal
  }}
>
  <Text style={styles.textStyle}>Go</Text>
</Pressable>
          </View>
        </View>
      </Modal>
   
      <View ref={scrollViewRef} style={styles.contentContainer}>
       
       {/* Level 7 Button */}
       <TouchableOpacity
          style={[styles.button, { backgroundColor: userScores[11] ? '' : '#7ED957' }]}
          onPress={() => handleButtonPress(11)}
        >
          <Text style={styles.buttonText}>Basic Greetings</Text>
        </TouchableOpacity>
        <View style={styles.button1}></View>
       {/* Level 14 Button */}

       <TouchableOpacity
          style={[
            styles.button,
            { 
              backgroundColor: userScores[22] 
                ? '#7ED957' 
                : userScores[11] 
                ? '#B17D52' // If level 7 is completed, change to brown
                : '#BFBBB1' 
            }
          ]}
          onPress={() => handleButtonPress(14)}
          disabled={userScores[22] || userScores[11] ? false : true}
        >
          <Text style={styles.buttonText}>Expression</Text>
        </TouchableOpacity>

        <View style={styles.button1}></View>

        {/* Level 20 Button */}
        <TouchableOpacity
          style={[
            styles.button,
            { 
              backgroundColor: userScores[33] 
                ? '#7ED957'
                : userScores[22] 
                ? '#B17D52' // If level 14 is completed, change to brown
                : '#BFBBB1' 
            }
          ]}
          onPress={() => handleButtonPress(20)}
          disabled={userScores[33] || userScores[22] ? false : true}
        >
          <Text style={styles.buttonText}>Directions</Text>
        </TouchableOpacity>
        <View style={styles.button1}></View>
        {/* Level 26 Button */}
        <TouchableOpacity
          style={[
            styles.button,
            { 
              backgroundColor: userScores[44] 
                ? '#7ED957'
                : userScores[33] 
                ? '#B17D52' // If level 20 is completed, change to brown
                : '#BFBBB1' 
            }
          ]}
          onPress={() => handleButtonPress(26)}
          disabled={userScores[44] || userScores[33] ? false : true}
        >
          <Text style={styles.buttonText}>Basic Emotions</Text>
        </TouchableOpacity>

        <View style={styles.button1}></View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
   centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    color: '#7A4010',
    textAlign: 'center',
    padding: 10,
    
  },
  modalView: {
    margin: 60,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'BauhausStd-Demi',
    fontSize: 16,
  },
  greetingText: {
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'BauhausStd-Demi',
    fontSize: 24,
  },
  coinImage: {
    width: 55,
    height: 50,
    marginLeft: 1,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#DBC9A2',
    height:40,
    width:100,
    borderRadius: 20,
  },

  container: {
    flex: 1,
    backgroundColor: '#FFF7D5',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
  },
  button2: {
    backgroundColor: '#7ED957',
    padding: 40,
    borderRadius: 30,
    marginTop: 124,
    width: 300,
    justifyContent: 'center', 
  },
  lockIcon: {
    alignSelf: 'center', 
    marginBottom: 1, 
  },
  button: {
    backgroundColor: '#BFBBB1',
    padding: 40,
    borderRadius: 30,
    marginTop: 10,
    width: 300,
    justifyContent: 'center', 
  },
  buttonM: {
    backgroundColor: '#BFBBB1',
    padding: 23,
    borderRadius: 4,
    marginTop: 10,
    width: 100,
    height: 1,
    justifyContent: 'center',
  },
  button1: {
    backgroundColor: '#333333',
    width: 4,
    marginTop: 15,
    height: 50,
    justifyContent: 'center', 
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'BauhausStd-Demi',
    fontSize: 27, 
  },
});

export default HPScreen;
