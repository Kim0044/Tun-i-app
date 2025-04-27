import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

const Header = ({title}) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [userDialect, setUserDialect] = useState('');
  const [userLevel, setUserLevel] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [pulseColor, setPulseColor] = useState('green');
  const [networkModalVisible, setNetworkModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (
        state.isConnected &&
        ((state.type === 'cellular' &&
          state.details.cellularGeneration === '2g') ||
          state.isInternetReachable === false)
      ) {
        setNetworkModalVisible(true);
      } else {
        setNetworkModalVisible(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUserUID = auth().currentUser.uid;
        const userData = await firestore()
          .collection('users')
          .doc(currentUserUID)
          .get();
        const {dialect, level, score} = userData.data();

        setUserDialect(dialect);
        setUserLevel(level);

        const storedScore = await AsyncStorage.getItem('score');
        if (storedScore && parseInt(storedScore) > score) {
          animatePulse();
        }
        setScore(score);
        AsyncStorage.setItem('score', score.toString());

        const unsubscribe = firestore()
          .collection('users')
          .doc(currentUserUID)
          .onSnapshot(snapshot => {
            const newScore = snapshot.data().score;
            if (parseInt(storedScore) > newScore) {
              animatePulse();
            }
            setScore(newScore);
            AsyncStorage.setItem('score', newScore.toString());
          });

        return unsubscribe;
      } catch (error) {}
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUserUID = auth().currentUser.uid;
        const userDocRef = firestore().collection('users').doc(currentUserUID);

        const userData = await userDocRef.get();
        const {dialect, level, score} = userData.data();

        setUserDialect(dialect);
        setUserLevel(level);
        AsyncStorage.setItem('level', level.toString());

        setScore(score);
        AsyncStorage.setItem('score', score.toString());

        const unsubscribe = userDocRef.onSnapshot(snapshot => {
          const updatedData = snapshot.data();
          if (updatedData) {
            const {level: newLevel, score: newScore} = updatedData;

            if (newLevel !== undefined && newLevel !== level) {
              setUserLevel(newLevel);
              AsyncStorage.setItem('level', newLevel.toString());
            }

            if (newScore !== undefined && newScore !== score) {
              setScore(newScore);
              AsyncStorage.setItem('score', newScore.toString());
              const color = parseInt(newScore) > score ? 'green' : 'red';
              animatePulse(color);
            }
          }
        });

        return () => unsubscribe();
      } catch (error) {}
    };

    fetchUserData();
  }, []);

  const animatePulse = color => {
    setPulseColor(color);
    Animated.sequence([
      Animated.timing(pulseAnimation, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
        <Image
          source={require('../../assets/user.png')}
          style={{width: 65, height: 60}}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={[styles.buttonText, {fontFamily: 'BauhausStd-Demi'}]}>
          {userDialect ? userDialect : 'Show Dialect'}
        </Text>
      </TouchableOpacity>

      <Image
        source={require('../../assets/check.png')}
        style={{width: 55, height: 50}}
      />
      <Text style={{fontWeight: 'bold'}}>{userLevel}/44</Text>
      <View style={styles.coinContainer}>
        <Animated.View
          style={[
            styles.pulse,
            {backgroundColor: pulseColor, transform: [{scale: pulseAnimation}]},
          ]}
        />
        <Image
          source={require('../../assets/coin.png')}
          style={styles.coinImage}
        />
      </View>
      <Text style={{fontWeight: 'bold', marginLeft: -3}}>{score}</Text>

      <Modal
        animationType="slide"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Are you sure you want to log out?
            </Text>
            <View style={{flexDirection: 'row', marginTop: 20}}>
              <Pressable
                style={[styles.button, styles.logoutButton]}
                onPress={() => {
                  setLogoutModalVisible(false);
                  navigation.navigate('Login');
                }}>
                <Text style={styles.buttonText}>Yes</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.closeButton]}
                onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={dropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalDropdownView}>
            <TouchableOpacity onPress={() => setLogoutModalVisible(true)}>
              <Text style={styles.modalDropdownText}>Log out</Text>
            </TouchableOpacity>
            {}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={networkModalVisible}
        onRequestClose={() => setNetworkModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Notice</Text>
            <Text style={styles.modalText}>
              Reconnecting... Please Check your network.
            </Text>
            <Pressable
              style={[styles.button, styles.closeButton]}
              onPress={() => setNetworkModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#DBC9A2',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    height: 130,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3c444c',
  },
  buttonText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 20,
  },

  optionText: {
    fontFamily: 'BauhausStd-Demi',
    fontSize: 25,
  },
  modalDropdownView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '50%',
  },
  modalDropdownText: {
    fontSize: 18,
    fontFamily: 'BauhausStd-Demi',
    paddingVertical: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 40,
    height: 60,
    width: 160,
    marginLeft: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 9},
        shadowOpacity: 1.1,
        shadowRadius: 200,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  coinContainer: {
    position: 'relative',
  },
  coinImage: {
    width: 55,
    height: 50,
    marginLeft: 1,
  },
  pulse: {
    position: 'absolute',
    marginLeft: 9,
    marginTop: 7,
    width: 36,
    height: 35,
    borderRadius: 70,
    opacity: 0.3,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exitButton: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  logoutButton: {
    backgroundColor: '#BFBBB1',
    marginRight: 10,
    fontSize: 1,
  },

  closeButton: {
    backgroundColor: '#B17D52',
    fontSize: 1,
  },

  dropdown: {
    position: 'absolute',
    top: 20,
    left: 12,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    height: 100,
    width: 400,
    elevation: 5,
    zIndex: 6,
  },
  dropdownText: {
    fontSize: 18,
    fontFamily: 'BauhausStd-Demi',
    paddingVertical: 5,
  },
});

export default Header;
