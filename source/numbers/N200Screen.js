import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Animated,
  Easing,
  BackHandler,
  TouchableWithoutFeedback,
  Modal,
  TouchableHighlight,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Header from '../components/Header';
import Video from 'react-native-video';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {debounce} from 'lodash';

const N200Screen = () => {
  const navigation = useNavigation();
  const [audioPlaying, setAudioPlaying] = useState(false);

  const [recognizedText, setRecognizedText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scaleValue, setScaleValue] = useState(new Animated.Value(1));
  const [orangeScaleValue, setOrangeScaleValue] = useState(
    new Animated.Value(1),
  );
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(16);
  const [orangeDelay] = useState(500);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [hintText, setHintText] = useState('');
  const [recognitionTimeout, setRecognitionTimeout] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [modalVisibleE, setModalVisibleE] = useState(false);

  const togglePlay = () => {
    setAudioPlaying(!audioPlaying);
  };

  const startVoiceRecognition = async () => {
    await Voice.destroy().then(Voice.removeAllListeners);
    setIsListening(true);
    setResponseText('');

    try {
      await Voice.start('en-US');

      if (recognitionTimeout) clearTimeout(recognitionTimeout);

      const timeout = setTimeout(() => {
        Voice.stop();
        setIsListening(false);
      }, 8000);

      setRecognitionTimeout(timeout);
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsListening(false);
      setResponseText('Error starting voice recognition.');
    }
  };

  useEffect(() => {
    if (responseText === 'Good job') {
      setAudioPlaying(true);
    } else {
      setAudioPlaying(false);
    }
  }, [responseText]);
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
        setHintText('Nalipay ko nga nakaila tika');

        setHintUsed(true);
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

  useEffect(() => {
    const handlePartialResults = event => {
      if (event.value && event.value.length > 0) {
        setRecognizedText(event.value[0]);

        if (recognitionTimeout) clearTimeout(recognitionTimeout);
      }
    };

    const handleFinalResults = event => {
      if (event.value && event.value.length > 0) {
        setRecognizedText(event.value[0]);
        checkKeyword(event.value[0]);

        if (recognitionTimeout) {
          clearTimeout(recognitionTimeout);
          setRecognitionTimeout(null);
        }
      }
      setIsListening(false);
    };

    Voice.onSpeechPartialResults = handlePartialResults;
    Voice.onSpeechResults = handleFinalResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (showModal && responseText === 'Good job') {
      Animated.timing(progress, {
        toValue: 106,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({finished}) => {
        if (finished) {
          navigateToMA();
        }
      });
    } else {
      progress.setValue(0);
    }
  }, [showModal, responseText]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );

    return () => backHandler.remove();
  }, []);

  const checkAndUpdateLevel = async level => {
    const userEmail = auth().currentUser.email;
    const userEmailWithLevel = `${userEmail}level${level}`;
    const doc = await firestore()
      .collection('scores')
      .doc(userEmailWithLevel)
      .get();
    if (doc.exists && doc.data().score === 1) {
      console.log(`Level ${level} is already completed.`);
    } else {
      await firestore()
        .collection('scores')
        .doc(userEmailWithLevel)
        .set({score: 1, level: level});
      const currentUserUID = auth().currentUser.uid;
      await firestore()
        .collection('users')
        .doc(currentUserUID)
        .update({level: level});
      console.log(`Level ${level} data updated successfully!`);
    }
  };

  const checkKeyword = async text => {
    const keywords = [
      'nalipay ko nga nakaila tika',
      'nalipay ko na kay latika',
      'nalipay ko nga nakailatika',
      'nalipay ko nga kaila tika',
      'nalipay ko na nakaelatika',
      'nalipay ko na nakailatika',
      'nalipay ko',
    ];
    const textLower = text.toLowerCase();

    const matchFound = keywords.some(keyword => textLower.includes(keyword));

    if (matchFound) {
      setResponseText('Good job');
      setShowModal(true);
      setScore(prevScore => prevScore + 1);
      setFailedAttempts(0);
      const currentUserUID = auth().currentUser.uid;
      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUserUID)
          .get();
        if (userDoc.exists) {
          let currentScore = userDoc.data().score || 0;
          currentScore += 1;

          await firestore().collection('users').doc(currentUserUID).update({
            score: currentScore,
          });

          console.log('Score updated successfully to:', currentScore);
        }
      } catch (error) {
        console.error('Failed to update score:', error);
      }

      checkAndUpdateLevel(level);
    } else {
      setResponseText("I'm sorry I didn't catch that, can you try again?");
      setScore(0);
      setFailedAttempts(prev => prev + 1);
    }
    setIsListening(false);
  };

  useEffect(() => {
    if (failedAttempts >= 3) {
      setModalMessage('Failed 3 attempts. Back to the start.');
      setModalVisibleE(true);

      setTimeout(() => {
        setFailedAttempts(0);
        setModalVisibleE(false);
        navigation.navigate('Numbers');
      }, 7000);
    }
  }, [failedAttempts]);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const startOrangeAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orangeScaleValue, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(orangeScaleValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  useEffect(() => {
    if (isListening) {
      startAnimation();
      setTimeout(() => {
        startOrangeAnimation();
      }, orangeDelay);
    }
  }, [isListening]);

  const onVideoEnd = () => {
    setIsVideoPlaying(false);
    setShowButton(true);
  };
  useEffect(() => {
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onVideoEndIntro = () => {
    setShowVideo(false);
    setShowButton(true);
    startVoiceRecognition();
  };

  const handleButtonPress = () => {
    setShowButton(false);
    setShowVideo(true);
  };

  const navigateToHP = () => {
    navigation.navigate('HP');
  };

  const navigateToMA = () => {
    navigation.navigate('N500');
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.contentContainer}>
        {showVideo && (
          <Video
            source={require('../../assets/video/intro-nalikai.mp4')}
            style={styles.video}
            resizeMode="cover"
            onEnd={onVideoEndIntro}
          />
        )}
        {showButton && !isVideoPlaying && (
          <TouchableOpacity onPress={handleButtonPress}>
            <Image
              source={require('../../assets/playback.png')}
              style={{width: 23, height: 23, marginLeft: -150}}
            />
          </TouchableOpacity>
        )}

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
            {}
            <Text style={styles.greetingText}>Expression</Text>
          </View>
          <Text style={styles.greetingText1}>Pleased to meet you</Text>

          <View style={styles.buttonContainer}>
            {hintText !== '' && (
              <Text style={styles.hintTextStyle}>{hintText}</Text>
            )}
          </View>
          <View style={styles.recordButtonContainer}>
            <TouchableOpacity onPress={startVoiceRecognition}>
              <Animated.View
                style={[
                  styles.recordButton,
                  isListening && {transform: [{scale: scaleValue}]},
                ]}
              />
              <Animated.View
                style={[
                  styles.orangeCircle,
                  isListening && {transform: [{scale: orangeScaleValue}]},
                ]}
              />
              <Image
                source={require('../../assets/record.png')}
                style={styles.recordImage}
              />
              {isListening && (
                <Text style={styles.responseText5}>Listening</Text>
              )}
            </TouchableOpacity>
            <Text
              style={[
                styles.responseText,
                responseText.includes(
                  "I'm sorry I didn't catch that, can you try again?",
                )
                  ? styles.errorText
                  : null,
              ]}>
              {responseText}
            </Text>

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
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
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
            <Video
              source={require('../../assets/audio/Goodjob.mp3')}
              paused={!audioPlaying}
              audioOnly={true}
              onError={e => console.log('Error with audio:', e)}
            />
          </View>

          <View style={styles.recordButtonContainer1}>
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
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 30,
    marginTop: 20,
    width: 350,
    height: 518,
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
  imageContainer: {
    position: 'absolute',
    top: 800,
    left: 177,
    zIndex: 999,
  },
  video: {
    marginTop: -80,
    width: 300,
    height: 120,
    borderRadius: 10,
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
  buttonClose: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  image: {
    width: 65,
    height: 64,
  },
  hintTextStyle: {
    fontSize: 18,
    color: 'blue',
    padding: 1,
    textAlign: 'center',
  },

  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 34,
  },
  boldText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 22,
    fontWeight: '100',
  },
  greetingText1: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 44,
    textAlign: 'center',
    marginBottom: 15,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 41,
  },
  greetingLabel: {
    fontSize: 20,
    marginRight: 5,
  },
  greetingText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 20,
    textAlign: 'left',
  },
  responseText1: {
    fontSize: 22,

    textAlign: 'center',
  },
  responseText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 40,
    marginTop: 9,
    textAlign: 'center',
    color: '#73DA45',
  },
  responseText5: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 20,
    marginTop: 9,
    textAlign: 'center',
    color: '#73DA45',
  },
  errorText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 20,
    marginTop: 9,
    textAlign: 'center',
    color: '#EC5353',
  },
  listeningText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 17,
    textAlign: 'center',
    marginTop: 11,
  },
  recognizedTextContainer: {
    alignItems: 'center',
    marginTop: 23,
    position: 'absolute',
  },
  recordButtonContainer: {
    position: 'relative',
    marginTop: 92,
  },
  recordButtonContainer1: {
    position: 'absolute',
    marginTop: 478,
    marginLeft: 130,
    justifyContent: 'center',
    flex: 1,
  },
  recordButton: {
    position: 'absolute',
    backgroundColor: 'rgb(234, 221, 202)',
    width: 90,
    height: 90,
    borderRadius: 60,
    top: 1,
    left: 109,
  },
  orangeCircle: {
    position: 'absolute',
    backgroundColor: 'rgb(205, 127, 50)',
    width: 87,
    height: 89,
    borderRadius: 60,
    top: 1,
    left: 110,
  },
  recordImage: {
    width: 90,
    height: 90,
    marginLeft: 110,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 70,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  modalText: {
    fontSize: 20,
    fontFamily: 'BauhausStd-Demi',
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
});

export default N200Screen;
