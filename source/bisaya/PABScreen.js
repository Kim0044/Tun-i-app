import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
} from 'react-native';
import Header from '../components/Header';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const PABScreen = ({navigation}) => {
  const [displayText, setDisplayText] = useState('');
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [level, setLevel] = useState(7);

  const handleButtonClick = text => {
    if (text === 'asa ang banyo') {
      setDisplayText('asa ang banyo');
      setShowTryAgain(false);
      setShowCorrect(true);

      const userEmail = auth().currentUser.email;

      const currentUserUID = auth().currentUser.uid;

      const userEmailWithLevel = `${userEmail}level${level}`;

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
    } else {
      setDisplayText(`${text}`);
      setShowTryAgain(true);
      setShowCorrect(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.card}>
          <Text style={styles.greetingText}>webtoon</Text>
          <Image
            source={require('../../assets/MA!.png')}
            style={styles.recordImage}
          />
          <Image
            source={require('../../assets/MA.png')}
            style={styles.recordImage}
          />
          <View style={styles.buttonContainer1}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleButtonClick('asa ang banyo')}>
              <Text style={styles.buttonText}>asa ang banyo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleButtonClick('nasan ang banyo')}>
              <Text style={styles.buttonText}>nasan ang banyo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleButtonClick('Hain an bayho')}>
              <Text style={styles.buttonText}>Hain an bayho</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.greetingText2}>{displayText}</Text>
          <TouchableOpacity style={styles.buttonContainer}>
            <Text style={styles.greetingText2}>
              Maayong adlaw! Kabalo ba ka "{displayText}"? where is the bathroom{' '}
            </Text>
          </TouchableOpacity>

          {showTryAgain && <Text style={styles.tryAgainText}>Try Again</Text>}
          {showCorrect && <Text style={styles.correctText}>Correct</Text>}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7D5',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 30,
    marginTop: 20,
    width: 350,
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
  recordImage: {
    width: 350,
    height: 220,
    marginBottom: 50,
    marginLeft: -34,
    position: 'relative',
  },
  greetingText1: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 45,
    textAlign: 'center',
    marginBottom: 10,
  },
  greetingText2: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 10,
    textAlign: 'center',
  },
  greetingText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    backgroundColor: '#FFF7D5',
    padding: 13,
    marginVertical: 5,
    width: '90%',
    borderRadius: 40,
    position: 'absolute',
    top: 360,
    left: 64,
  },
  buttonContainer1: {
    marginTop: 60,
    width: '96%',
    position: 'absolute',
    top: 378,
    left: 141,
  },
  button: {
    backgroundColor: '#BFBBB1',
    padding: 6,
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
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
  correctText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'lightgreen',
  },
});

export default PABScreen;
