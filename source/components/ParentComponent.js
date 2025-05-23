import React, {useState, useEffect} from 'react';
import Header from './Header';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ParentComponent = () => {
  const [levelDataCount, setLevelDataCount] = useState(0);

  useEffect(() => {
    const fetchUserDialect = async () => {
      try {
        const user = auth().currentUser;
        const userData = await firestore()
          .collection('users')
          .doc(user.uid)
          .get();
        const dialect = userData.data().dialect;
        setUserDialect(dialect);
      } catch (error) {
        console.error('Error fetching user dialect:', error);
      }
    };

    const fetchLevelDataCount = async () => {
      try {
        const user = auth().currentUser;
        const userEmail = user.email;
        let count = 0;
        for (let i = 1; i <= 26; i++) {
          const userEmailWithLevel = `${userEmail}level${i}`;
          const doc = await firestore()
            .collection('scores')
            .doc(userEmailWithLevel)
            .get();
          if (doc.exists) {
            count++;
          }
        }
        setLevelDataCount(count);
      } catch (error) {
        console.error('Error fetching level data count:', error);
      }
    };

    fetchUserDialect();
    fetchLevelDataCount();
  }, []);

  return (
    <>
      <Header levelDataCount={levelDataCount} />
      {}
    </>
  );
};

export default ParentComponent;
