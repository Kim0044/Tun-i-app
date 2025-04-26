import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, } from 'react-native';
import Header from '../components/Header';
import firestore from '@react-native-firebase/firestore'; 
import auth from '@react-native-firebase/auth';

const  NumbersScreen = ({ navigation, route }) => {
  const scrollViewRef = useRef();
  const [userLevelColor, setUserLevelColor] = useState({});
  const [dataAvailable, setDataAvailable] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserScores = async () => {
      const userEmail = auth().currentUser.email;
      const newDataAvailable = {};
      for (let i = 12; i <= 23; i++) {
        const userEmailWithLevel = `${userEmail}level${i}`;
        const doc = await firestore().collection('scores').doc(userEmailWithLevel).get();
        newDataAvailable[i] = doc.exists; // Store whether data exists for this level
        setUserLevelColor(prevColors => ({ ...prevColors, [i]: doc.exists ? '#7ED957' : '#B17D52' }));
      }
      setDataAvailable(newDataAvailable); // Update the state
    };

    fetchUserScores();
  }, []);

  const handleButtonPress = (level) => {
    switch(level) {
      case 12:
        navigation.navigate('N1to10');
        break;
      case 13:
        navigation.navigate('N20');
        break;
      case 14:
        navigation.navigate('N50');
        break;
      case 15:
        navigation.navigate('N100');
        break;
      case 16:
        navigation.navigate('N200');
        break;
      case 17:
        navigation.navigate('N500');
        break;
      case 18:
        navigation.navigate('N1000');
        break;
        case 19:
          navigation.navigate('DSTB');
          break;
          case 20:
            navigation.navigate('DBB');
            break;
            case 21:
              navigation.navigate('DR');
              break;
              case 22:
                navigation.navigate('DWRS');
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
          {[12, 13, 14, 15, 16, 17,].map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.button2,
                { backgroundColor: userLevelColor[level] },
                level !== 12 && !dataAvailable[level] && { backgroundColor: '#CCCCCC' },
                !dataAvailable[level] && dataAvailable[level - 12] && { backgroundColor: '#B17D52' },
              ]}
              onPress={() => handleButtonPress(level)}
              disabled={!dataAvailable[level] && !dataAvailable[level - 12] && level !== 12}
            >
              <Text style={[styles.buttonText, { fontFamily: 'BauhausStd-Demi' }]}>

                  {level === 12 ? 'Thank you' : level === 13 ? 'Your welcome' : level === 14 ? 'Im sorry' : level === 15 ? 'I like you' : level === 16 ? 'Pleased to meet you' : level === 17 ? 'Kamusta man ka?' : '' }
              </Text>
              </TouchableOpacity>
          ))}
          {dataAvailable[17] && ( // Conditional rendering based on level 6
            <TouchableOpacity 
              style={styles.button2}
              onPress={() => setModalVisible(true)}
            >
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
  }}
>
  <View style={styles.centeredView}>
    <View style={styles.modalView}>
      <Text style={styles.modalText}>Expression Games</Text>
      <View style={styles.gridContainer}>
        {[18, 19, 20, 21, 22,].slice(0, 5).map((level, index) => (
          <View key={level} style={styles.gridItem}>
            <TouchableOpacity
              style={[styles.button2, { marginBottom: 10 }]}  // Added marginBottom for spacing between rows
              onPress={() => {
                handleButtonPress(level);
                setModalVisible(false);
              }}
            >
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
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
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
    width: '48%', // Nearly half width to accommodate two items per row
    marginBottom: 10, // Space between rows
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'BauhausStd-Demi',
    fontSize: 27,
  },
});


export default  NumbersScreen;
