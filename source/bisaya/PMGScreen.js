import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  Image,
  Modal,
  TouchableHighlight,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import Header from '../components/Header';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const PMGScreen = ({navigation}) => {
  const [displayText, setDisplayText] = useState('');
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [level, setLevel] = useState(10);
  const [score, setScore] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [congratsModalVisible, setCongratsModalVisible] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const backgroundColor = useRef(new Animated.Value(0)).current;
  const [responseText, setResponseText] = useState('');
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [modalVisibleE, setModalVisibleE] = useState(false);

  useEffect(() => {
    if (displayText === 'Maayong gabii') {
      Animated.timing(progress, {
        toValue: 100,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({finished}) => {
        if (finished) {
          navigateToPTA();
        }
      });
    } else {
      progress.setValue(0);
    }
  }, [displayText]);

  const navigateToHP = () => {
    navigation.navigate('HP');
  };

  const navigateToPTA = () => {
    navigation.navigate('PTA');
  };

  const buttonBackgroundColor = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#BFBBB1', '#a1d162'],
  });

  const handleButtonClick = text => {
    if (text === 'Maayong gabii') {
      setDisplayText('Maayong gabii');
      setShowTryAgain(false);
      setShowCorrect(true);
      setFailedAttempts(0);

      incrementScore();

      const currentUserUID = auth().currentUser.uid;
      const userEmail = auth().currentUser.email;
      const userEmailWithLevel = `${userEmail}level${level}`;

      firestore()
        .collection('users')
        .doc(currentUserUID)
        .get()
        .then(doc => {
          if (doc.exists) {
            const userCurrentLevel = doc.data().level;

            if (!userCurrentLevel || userCurrentLevel < level) {
              firestore()
                .collection('users')
                .doc(currentUserUID)
                .update({level: level})
                .then(() => {
                  console.log('Level data updated successfully!');
                })
                .catch(error => {
                  console.error('Error updating level data: ', error);
                });

              firestore()
                .collection('scores')
                .doc(userEmailWithLevel)
                .set({score: 1, level: level})
                .then(() => {
                  console.log('Score and level data saved successfully!');
                })
                .catch(error => {
                  console.error('Error saving score and level data: ', error);
                });
            } else {
              console.log(
                'Level update skipped as the current level is the same or higher.',
              );
            }
          }
        })
        .catch(error => {
          console.error('Error fetching user data: ', error);
        });
    } else {
      setDisplayText(`${text}`);
      setShowTryAgain(true);
      setShowCorrect(false);
      setFailedAttempts(failedAttempts + 1);
    }
  };

  useEffect(() => {
    if (failedAttempts >= 3) {
      setModalMessage('Failed 3 attempts. Please try again!');
      setModalVisibleE(true);

      setTimeout(() => {
        setModalVisibleE(false);
        navigation.navigate('HIAM');
        setFailedAttempts(0);
      }, 3000);
    }
  }, [failedAttempts, navigation]);

  const triggerPulseAnimation = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.timing(backgroundColor, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(backgroundColor, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };

  const incrementScore = async () => {
    try {
      const currentUserUID = auth().currentUser.uid;
      const userDoc = await firestore()
        .collection('users')
        .doc(currentUserUID)
        .get();
      const currentScore = userDoc.data().score || 0;
      const newScore = currentScore + 1;
      await firestore()
        .collection('users')
        .doc(currentUserUID)
        .update({score: newScore});
      setScore(newScore);
      console.log('Score incremented successfully!');
    } catch (error) {
      console.error('Error incrementing score: ', error);
    }
  };

  const handlePress = async () => {
    try {
      if (hintUsed) {
        setModalMessage(
          'Only 10 points per game can be used to reveal a hint.',
        );
        setModalVisible(true);
        return;
      }

      const currentUserUID = auth().currentUser.uid;
      const userDoc = await firestore()
        .collection('users')
        .doc(currentUserUID)
        .get();
      const currentScore = userDoc.data().score;

      if (currentScore >= 10) {
        const newScore = currentScore - 10;
        await firestore()
          .collection('users')
          .doc(currentUserUID)
          .update({score: newScore});
        setScore(newScore);
        setHintUsed(true);
        triggerPulseAnimation();
      } else if (currentScore === 0) {
        setModalMessage("You don't have enough points for a hint.");
        setModalVisible(true);
      } else {
        setModalMessage('Score cannot be less than 10.');
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error handling button press:', error);
      setModalMessage(`Error: ${error.message}`);
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableHighlight
              style={styles.buttonClose}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Close</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleE}
        onRequestClose={() => {
          setModalVisibleE(!modalVisibleE);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>
      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={congratsModalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setCongratsModalVisible(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Congratulations!</Text>
            <TouchableWithoutFeedback onPress={navigateToHP}>
              <View style={styles.imageContainer1}>
                <Image
                  source={require('../../assets/h.png')}
                  style={styles.image}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </Modal>
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                height: 5,
                backgroundColor: '#73DA45',
                position: 'absolute',
                top: 1,
                left: 15,
              },
            ]}
          />
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingLabel}>Basic:</Text>
            <Text style={styles.greetingText}>Greetings</Text>
          </View>
          <Text style={styles.greetingText1}>Good evening!</Text>

          <TouchableOpacity style={styles.buttonContainer}>
            <Text style={styles.greetingText2}>{displayText}</Text>
          </TouchableOpacity>

          {showTryAgain && <Text style={styles.tryAgainText}>Try Again</Text>}
          {showCorrect && <Text style={styles.correctText}>Correct</Text>}
          <View style={styles.buttonContainer1}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleButtonClick('Maayong buntag')}>
              <Text style={styles.buttonText}>Maayong buntag</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleButtonClick('Maayong hapon')}>
              <Text style={styles.buttonText}>Maayong hapon</Text>
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.button,
                {transform: [{scale}], backgroundColor: buttonBackgroundColor},
              ]}>
              <TouchableOpacity
                onPress={() => handleButtonClick('Maayong gabii')}>
                <Text style={styles.buttonText}>Maayong gabii</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleButtonClick('Kumusta')}>
              <Text style={styles.buttonText}>Kumusta</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handlePress}>
            <Text style={styles.responseText1}>
              Hint:
              <Image
                source={require('../../assets/coin1.png')}
                style={{width: 20.9, height: 20}}
              />
              <Text style={styles.boldText}>10</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableWithoutFeedback onPress={navigateToHP}>
        <View style={styles.imageContainer}>
          <Image source={require('../../assets/h.png')} style={styles.image} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7D5',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 41,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 30,
    marginTop: -67,
    width: 350,
    height: 600,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0.1, 0.1, 0.1, 0.1)',
  },
  greetingText1: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 45,
    textAlign: 'center',
    marginBottom: 10,
  },
  recognizedTextContainer: {
    alignItems: 'center',
    marginTop: 23,
    position: 'absolute',
  },
  boldText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 22,
    fontWeight: '100',
  },
  modalView: {
    margin: 20,
    marginTop: 400,
    backgroundColor: '#DBC9A2',
    borderRadius: 20,
    padding: 35,
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
  modalText: {
    fontSize: 20,
    fontFamily: 'BauhausStd-Demi',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    marginTop: 23,
    elevation: 2,
  },
  progressBar: {
    height: 5,
    backgroundColor: '#56cc49',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 9,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  responseText1: {
    fontSize: 22,
    marginTop: 57,
    textAlign: 'center',
  },
  greetingText2: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 33,
    textAlign: 'center',
  },
  greetingText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 20,
    textAlign: 'left',
  },
  greetingLabel: {
    fontSize: 20,
    marginRight: 5,
  },
  greetingText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 0,
  },
  responseText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 40,
    marginTop: 9,
    textAlign: 'center',
    color: '#73DA45',
  },
  buttonContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 0,
    alignSelf: 'center',
    width: 270,
    borderWidth: 0,
    marginTop: 90,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  imageContainer: {
    position: 'absolute',
    top: 800,
    left: 177,
    zIndex: 999,
  },
  imageContainer1: {
    marginLeft: -200,
    top: 19,
  },
  buttonContainer1: {
    marginTop: 60,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  image: {
    width: 65,
    height: 64,
  },
  button: {
    backgroundColor: '#BFBBB1',
    padding: 14,
    marginVertical: 5,
    width: '45%',
    borderRadius: 40,
  },
  buttonText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tryAgainText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 20,
    marginTop: 9,
    textAlign: 'center',
    color: 'red',
  },
  correctText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 30,
    marginTop: 9,
    textAlign: 'center',
    color: '#73DA45',
  },
});

export default PMGScreen;
