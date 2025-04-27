import React, {useRef, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Button,
} from 'react-native';
import Header from '../components/Header';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const SectionScreen = ({navigation, route}) => {
  const scrollViewRef = useRef();
  const [userLevelColor, setUserLevelColor] = useState({});
  const [dataAvailable, setDataAvailable] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserScores = async () => {
      const userEmail = auth().currentUser.email;
      const newDataAvailable = {};
      for (let i = 1; i <= 11; i++) {
        const userEmailWithLevel = `${userEmail}level${i}`;
        const doc = await firestore()
          .collection('scores')
          .doc(userEmailWithLevel)
          .get();
        newDataAvailable[i] = doc.exists;
        setUserLevelColor(prevColors => ({
          ...prevColors,
          [i]: doc.exists ? '#7ED957' : '#B17D52',
        }));
      }
      setDataAvailable(newDataAvailable);
    };

    fetchUserScores();
  }, []);

  const handleButtonPress = level => {
    switch (level) {
      case 1:
        navigation.navigate('HIAM');
        break;
      case 2:
        navigation.navigate('MA');
        break;
      case 3:
        navigation.navigate('MH');
        break;
      case 4:
        navigation.navigate('MG');
        break;
      case 5:
        navigation.navigate('KA');
        break;
      case 6:
        navigation.navigate('TA');
        break;
      case 7:
        navigation.navigate('PMA');
        break;
      case 8:
        navigation.navigate('PHY');
        break;
      case 9:
        navigation.navigate('PMU');
        break;
      case 10:
        navigation.navigate('PMG');
        break;
      case 11:
        navigation.navigate('PTA');
        break;

      default:
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.contentContainer}>
        <View style={styles.column}>
          {[1, 2, 3, 4, 5, 6].map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.button2,
                {backgroundColor: userLevelColor[level]},
                level !== 1 &&
                  !dataAvailable[level] && {backgroundColor: '#CCCCCC'},
                !dataAvailable[level] &&
                  dataAvailable[level - 1] && {backgroundColor: '#B17D52'},
              ]}
              onPress={() => handleButtonPress(level)}
              disabled={
                !dataAvailable[level] &&
                !dataAvailable[level - 1] &&
                level !== 1
              }>
              <Text
                style={[styles.buttonText, {fontFamily: 'BauhausStd-Demi'}]}>
                {level === 1
                  ? 'Hi I am'
                  : level === 2
                  ? 'Good Morning'
                  : level === 3
                  ? 'Good Afternoon'
                  : level === 4
                  ? 'Good Evening'
                  : level === 5
                  ? 'How are you?'
                  : level === 6
                  ? 'Kamusta man ka?'
                  : ''}
              </Text>
            </TouchableOpacity>
          ))}
          {dataAvailable[6] && (
            <TouchableOpacity
              style={styles.button2}
              onPress={() => setModalVisible(true)}>
              <Text style={styles.buttonText}>Games</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Basic Greetings Games</Text>
            <View style={styles.gridContainer}>
              {[7, 8, 9, 10, 11].slice(0, 6).map((level, index) => (
                <View key={level} style={styles.gridItem}>
                  <TouchableOpacity
                    style={[styles.button2, {marginBottom: 10}]}
                    onPress={() => {
                      handleButtonPress(level);
                      setModalVisible(false);
                    }}>
                    <Text style={styles.buttonText}> Level {level} </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7D5',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  button2: {
    backgroundColor: '#888888',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 20,
    width: 160,
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
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
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'BauhausStd-Demi',
    fontSize: 27,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'BauhausStd-Demi',
    fontSize: 27,
  },
});

export default SectionScreen;
