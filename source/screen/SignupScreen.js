import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Button,
  Pressable,
} from 'react-native';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';

const SignupScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [dialect, setDialect] = useState('');
  const [isDialectModalVisible, setDialectModalVisible] = useState(false);

  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const [usernameFilled, setUsernameFilled] = useState(false);
  const [emailFilled, setEmailFilled] = useState(false);
  const [passwordFilled, setPasswordFilled] = useState(false);
  const [confirmPasswordFilled, setConfirmPasswordFilled] = useState(false);
  const [genderFilled, setGenderFilled] = useState(false);
  const [dateFilled, setDateFilled] = useState(false);

  const generateRandomString = (length = 16) => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  const handleSubmit = () => {
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !gender ||
      !selectedDate ||
      !dialect
    ) {
      setErrorModalVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('User signed up successfully:', user.uid);

        const randomText = generateRandomString();

        DeviceInfo.getDeviceName().then(deviceName => {
          firestore()
            .collection('users')
            .doc(user.uid)
            .set({
              username: username,
              email: email,
              gender: gender,
              birthdate: selectedDate,
              dialect: dialect,
              password: password,
              score: 50,
              daily: 1,
              deviceName: deviceName,
              randomText: randomText,
            })
            .then(() => {
              console.log('User data saved to Firestore!');
              navigation.navigate('Login');
            })
            .catch(error => {
              console.error('Error saving user data to Firestore:', error);
            });
        });
      })
      .catch(error => {
        console.error('Error signing up:', error);
      });
  };

  const ErrorModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isErrorModalVisible}
      onRequestClose={() => setErrorModalVisible(false)}>
      <View style={styles.centeredView}>
        <View style={styles.modalContent}>
          <Pressable
            style={styles.exitButton}
            onPress={() => setErrorModalVisible(false)}>
            <Text style={{fontWeight: 'bold', fontSize: 15}}>✖️</Text>
          </Pressable>
          <Text
            style={{
              color: '#996633',
              fontSize: 18,
              textAlign: 'center',
              fontFamily: 'BauhausStd-Demi',
            }}>
            Please fill out all required fields. 😁
          </Text>
        </View>
      </View>
    </Modal>
  );

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleModal1 = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleDialectModal = () => {
    setDialectModalVisible(!isDialectModalVisible);
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = date => {
    hideDatePicker();

    const formattedDate = date.toISOString().split('T')[0];

    setSelectedDate(formattedDate);
    setDateFilled(true);
  };

  const selectGender = selectedGender => {
    setGender(selectedGender);
    toggleModal();
    setGenderFilled(true);
  };
  const selectDialect = selectedDialect => {
    setDialect(selectedDialect);
    toggleDialectModal();
  };

  const checkPasswordStrength = password => {
    if (password.length >= 8) {
      return {strength: 'Strong', color: 'green'};
    } else if (password.length >= 6) {
      return {strength: 'Medium', color: 'orange'};
    } else {
      return {strength: 'Weak', color: 'red'};
    }
  };

  const handlePasswordChange = text => {
    setPassword(text);
    const strengthInfo = checkPasswordStrength(text);
    setPasswordStrength(strengthInfo.strength);
    setPasswordFilled(!!text);
  };

  const handleConfirmPasswordChange = text => {
    setConfirmPassword(text);
    setConfirmPasswordFilled(!!text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Image
        source={require('../../assets/l1.png')}
        style={{width: 111, height: 60}}
      />

      <Text style={[{fontFamily: 'BauhausStd-Demi'}]}>Username</Text>
      <TextInput
        style={[styles.input, !usernameFilled && styles.inputError]}
        onChangeText={text => {
          setUsername(text);
          setUsernameFilled(!!text);
        }}
      />
      {!usernameFilled && (
        <Text style={styles.errorText}>This field is required</Text>
      )}

      <Text style={[{fontFamily: 'BauhausStd-Demi'}]}>Email</Text>
      <TextInput
        style={[styles.input, !emailFilled && styles.inputError]}
        onChangeText={text => {
          setEmail(text.trim());
          setEmailFilled(!!text.trim());
        }}
      />

      {!emailFilled && (
        <Text style={styles.errorText}>This field is required</Text>
      )}

      <Text style={[{fontFamily: 'BauhausStd-Demi'}]}>Password</Text>

      <TextInput
        style={[styles.input, !passwordFilled && styles.inputError]}
        secureTextEntry
        onChangeText={handlePasswordChange}
      />
      {password && (
        <Text style={{color: checkPasswordStrength(password).color}}>
          Password Strength: {checkPasswordStrength(password).strength}
        </Text>
      )}
      {!passwordFilled && (
        <Text style={styles.errorText}>This field is required</Text>
      )}

      {passwordStrength === 'Strong' && (
        <React.Fragment>
          <Text>Confirm Password</Text>
          <TextInput
            style={[styles.input, !confirmPasswordFilled && styles.inputError]}
            secureTextEntry
            onChangeText={handleConfirmPasswordChange}
          />
        </React.Fragment>
      )}

      <Text style={[{fontFamily: 'BauhausStd-Demi'}]}>Gender</Text>
      <TouchableOpacity
        onPress={toggleModal}
        style={[styles.genderInput, !genderFilled && styles.inputError]}>
        <Text>{gender ? gender : 'Select Gender'}</Text>
      </TouchableOpacity>

      <Text style={[{fontFamily: 'BauhausStd-Demi'}]}>Birthdate</Text>
      <TouchableOpacity
        onPress={showDatePicker}
        style={[styles.genderInput, !dateFilled && styles.inputError]}>
        <Text>{selectedDate ? selectedDate : 'Select Date'}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <Text style={[{fontFamily: 'BauhausStd-Demi'}]}>Dialect</Text>
      {}
      <TouchableOpacity
        onPress={toggleDialectModal}
        style={[styles.genderInput, !dateFilled && styles.inputError]}>
        <Text>{dialect ? dialect : 'Select Dialect'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: '#996633',
          borderRadius: 18,
          paddingVertical: 18,
          width: '40%',
          alignItems: 'center',
          marginTop: 20,
        }}>
        <Text style={{fontSize: 18, color: '#fff', fontWeight: '700'}}>
          Submit
        </Text>
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onSwipeComplete={toggleModal1}
        swipeDirection={['up', 'down']}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View
          style={{
            backgroundColor: 'white',
            padding: 22,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}>
          <TouchableOpacity
            onPress={() => selectGender('Male')}
            style={styles.genderOption}>
            <Text style={styles.boldText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => selectGender('Female')}
            style={styles.genderOption}>
            <Text style={styles.boldText}>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => selectGender('Others')}
            style={styles.genderOption}>
            <Text style={styles.boldText}>Others</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        isVisible={isDialectModalVisible}
        onSwipeComplete={toggleDialectModal}
        swipeDirection={['up', 'down']}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View
          style={{
            backgroundColor: 'white',
            padding: 22,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}>
          <TouchableOpacity
            onPress={() => selectDialect('Bisaya')}
            style={styles.dialectOption}>
            <Text style={styles.boldText}>Bisaya</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ErrorModal />
    </View>
  );
};

const styles = StyleSheet.create({
  boldText: {
    fontWeight: 'bold',
  },
  genderOption: {
    marginVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF7D5',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3c444c',
    marginBottom: 50,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    paddingLeft: 10,
    width: '80%',
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
    width: '100%',
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
  exitButton: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  genderInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    paddingLeft: 10,
    justifyContent: 'center',
    width: '80%',
  },

  errorText: {
    color: 'gray',
    marginTop: 1,
  },
});

export default SignupScreen;
