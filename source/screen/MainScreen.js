import React, {useState, useEffect} from 'react';
import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import Sound from 'react-native-sound';
import Video from 'react-native-video';
import Voice from '@react-native-voice/voice';

import Header from '../components/Header';

const HPScreen = ({navigation}) => {
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    setIsPlaying(false);
  }, []);

  const playSound = () => {
    const newSound = new Sound(
      require('../../assets/audio/greeting.mp3'),
      error => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
        setSound(newSound);
        newSound.play(() => {
          setIsPlaying(false);
        });
        setIsPlaying(true);
        setTimeout(() => {
          newSound.stop();
          setIsPlaying(false);
        }, 1000);
      },
    );
  };

  const startVoiceRecognition = async () => {
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.error(error);
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    Voice.onSpeechResults = event => {
      const recognizedText = event.value[0];
      setRecognizedText(recognizedText);
      checkKeyword(recognizedText);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const checkKeyword = text => {
    if (text.toLowerCase().includes('maayong buntag')) {
      setResponseText('Good job ✅');
    } else {
      setResponseText('Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.greetingText}>Basic Greetings</Text>
          <Text style={styles.greetingText1}>Maayong buntag!</Text>

          <View style={styles.buttonAndVideoContainer}>
            <TouchableOpacity onPress={playSound}>
              <Image
                source={require('../../assets/play.png')}
                style={{width: 65, height: 60, marginRight: 5}}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
              <Video
                source={require('../../assets/video/wave.mp4')}
                style={styles.video}
                resizeMode="cover"
                paused={!isPlaying}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.recordButtonContainer}>
            <TouchableOpacity
              onPressIn={startVoiceRecognition}
              onPressOut={stopVoiceRecognition}>
              <Image
                source={require('../../assets/record.png')}
                style={{width: 90, height: 90, marginLeft: 110}}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.responseText}>{responseText}</Text>
        </View>
      </View>
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
    padding: 20,
    borderRadius: 30,
    marginTop: 20,
    width: 350,
    height: 500,
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
  buttonAndVideoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText1: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 45,
    textAlign: 'center',
    marginBottom: 10,
  },
  video: {
    width: 220,
    height: 100,
  },
  greetingText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  responseText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 20,
    marginTop: 23,
    textAlign: 'center',
  },
});

export default HPScreen;
