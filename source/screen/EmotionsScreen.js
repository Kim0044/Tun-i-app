import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Header from '../components/Header';
import firestore from '@react-native-firebase/firestore'; 
import auth from '@react-native-firebase/auth';

const  EmotionsScreen = ({ navigation, route }) => {
  const scrollViewRef = useRef();
  const [userLevelColor, setUserLevelColor] = useState({});
  const [dataAvailable, setDataAvailable] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserScores = async () => {
      const userEmail = auth().currentUser.email;
      const newDataAvailable = {};
      for (let i = 33; i <= 44; i++) {
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
      case 33:
        navigation.navigate('NAL');
        break;
      case 34:
        navigation.navigate('NAO');
        break;
      case 35:
        navigation.navigate('NHK');
        break;
      case 36:
        navigation.navigate('NALI');
        break;
      case 37:
        navigation.navigate('NALP');
        break;
      case 38:
        navigation.navigate('NASK');
        break;
        case 39:
          navigation.navigate('G12');
          break;
          case 40:
            navigation.navigate('G13');
            break;
            case 41:
              navigation.navigate('G14');
              break;
              case 42:
                navigation.navigate('G15');
                break;
                case 43:
                  navigation.navigate('G16');
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
          {[34,35,36,37,38,39,].map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.button2,
                { backgroundColor: userLevelColor[level] },
                level !== 34 && !dataAvailable[level] && { backgroundColor: '#CCCCCC' },
                !dataAvailable[level] && dataAvailable[level - 34] && { backgroundColor: '#B17D52' },
              ]}
              onPress={() => handleButtonPress(level)}
              disabled={!dataAvailable[level] && !dataAvailable[level - 34] && level !== 34}
            >
              <Text style={[styles.buttonText, { fontFamily: 'BauhausStd-Demi' }]}>
              {level === 34 ? 'Nalibog ko' : level === 35 ? 'Nagmug-ot' : level === 36 ? 'Nahadlok' : level === 37 ? 'Nalain' : level === 38 ? 'Nalipay' : level === 39 ? 'Nasuko' :   '' }
               
              </Text>
              </TouchableOpacity>
          ))}
          {dataAvailable[39] && ( // Conditional rendering based on level 6
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
      <Text style={styles.modalText}>Basic Emotion Games</Text>
      <View style={styles.gridContainer}>
        {[40,41,42,43,44,].slice(0, 5).map((level, index) => (
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


export default  EmotionsScreen;
