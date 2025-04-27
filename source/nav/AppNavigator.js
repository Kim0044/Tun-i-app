import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

//basic Greetings
import MAScreen from '../bisaya/MAScreen';
import MGScreen from '../bisaya/MGScreen';
import MHScreen from '../bisaya/MHScreen';
import TAScreen from '../bisaya/TAScreen';
import KAScreen from '../bisaya/KAScreen';

import PMAScreen from '../bisaya/PMAScreen';
import PHYScreen from '../bisaya/PHYScreen';

import PMGScreen from '../bisaya/PMGScreen';
import PTAScreen from '../bisaya/PTAScreen';
import PABScreen from '../bisaya/PABScreen';
import PMUScreen from '../bisaya/PMUScreen';

import HIAMScreen from '../bisaya/HIAMScreen';

//numbers
import N1to10Screen from '../numbers/N1to10Screen';
import N20Screen from '../numbers/N20Screen';
import N50Screen from '../numbers/N50Screen';
import N100Screen from '../numbers/N100Screen';
import N200Screen from '../numbers/N200Screen';
import N500Screen from '../numbers/N500Screen';
import N1000Screen from '../numbers/N1000Screen';

import DSTBScreen from '../numbers/DSTBScreen';
import DRScreen from '../numbers/DRScreen';
import DBBScreen from '../numbers/DBBScreen';
import DWRSScreen from '../numbers/DWRSScreen';

//directions

import DidtodiriScreen from '../directions/DidtodiriScreen';
import KilidatbanglikodScreen from '../directions/KilidatbanglikodScreen';
import NawalakoScreen from '../directions/NawalakoScreen';
import TaasbabaScreen from '../directions/TaasbabaScreen';
import TouwalaScreen from '../directions/TouwalaScreen';
import UPScreen from '../directions/UPScreen';

import GTWScreen from '../directions/GTWScreen';
import GTBScreen from '../directions/GTBScreen';
import GNWKScreen from '../directions/GNWKScreen';
import GKALScreen from '../directions/GKALScreen';
import AsaangScreen from '../directions/AsaangScreen';

//emotions
import NaglibogScreen from '../emotions/NaglibogScreen';
import NagmugotScreen from '../emotions/NagmugotScreen';
import NahadlokScreen from '../emotions/NahadlokScreen';
import NalainScreen from '../emotions/NalainScreen';
import NalipayScreen from '../emotions/NalipayScreen';
import NasukoScreen from '../emotions/NasukoScreen';
import G12Screen from '../emotions/G12Screen';
import G13Screen from '../emotions/G13Screen';
import G14Screen from '../emotions/G14Screen';
import G15Screen from '../emotions/G15Screen';
import G16Screen from '../emotions/G16Screen';

//nav
import HPScreen from '../screen/HPScreen';
import SectionScreen from '../screen/SectionScreen';
import NumbersScreen from '../screen/NumbersScreen';
import DirectionsScreen from '../screen/DirectionsScreen';
import EmotionsScreen from '../screen/EmotionsScreen';
import WelcomeScreen from '../screen/WelcomeScreen';
import LoginScreen from '../screen/LoginScreen';
import SignupScreen from '../screen/SignupScreen';

const Stack = createNativeStackNavigator();
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Section" component={SectionScreen} />
        <Stack.Screen name="Numbers" component={NumbersScreen} />
        <Stack.Screen name="Directions" component={DirectionsScreen} />

        <Stack.Screen name="Emotions" component={EmotionsScreen} />

        <Stack.Screen name="HP" component={HPScreen} />
        <Stack.Screen name="HIAM" component={HIAMScreen} />
        <Stack.Screen name="MA" component={MAScreen} />
        <Stack.Screen name="TA" component={TAScreen} />
        <Stack.Screen name="MH" component={MHScreen} />
        <Stack.Screen name="MG" component={MGScreen} />
        <Stack.Screen name="KA" component={KAScreen} />
        <Stack.Screen name="PMA" component={PMAScreen} />
        <Stack.Screen name="PAB" component={PABScreen} />

        <Stack.Screen name="PHY" component={PHYScreen} />
        <Stack.Screen name="PMU" component={PMUScreen} />
        <Stack.Screen name="PMG" component={PMGScreen} />
        <Stack.Screen name="PTA" component={PTAScreen} />

        <Stack.Screen name="N1to10" component={N1to10Screen} />
        <Stack.Screen name="N20" component={N20Screen} />
        <Stack.Screen name="N50" component={N50Screen} />
        <Stack.Screen name="N100" component={N100Screen} />
        <Stack.Screen name="N200" component={N200Screen} />
        <Stack.Screen name="N500" component={N500Screen} />
        <Stack.Screen name="N1000" component={N1000Screen} />

        <Stack.Screen name="DSTB" component={DSTBScreen} />
        <Stack.Screen name="DR" component={DRScreen} />
        <Stack.Screen name="DBB" component={DBBScreen} />
        <Stack.Screen name="DWRS" component={DWRSScreen} />

        <Stack.Screen name="AA" component={AsaangScreen} />
        <Stack.Screen name="DD" component={DidtodiriScreen} />
        <Stack.Screen name="KAL" component={KilidatbanglikodScreen} />
        <Stack.Screen name="NWK" component={NawalakoScreen} />
        <Stack.Screen name="TB" component={TaasbabaScreen} />
        <Stack.Screen name="TW" component={TouwalaScreen} />
        <Stack.Screen name="UP" component={UPScreen} />

        <Stack.Screen name="GTW" component={GTWScreen} />
        <Stack.Screen name="GTB" component={GTBScreen} />
        <Stack.Screen name="GNWK" component={GNWKScreen} />
        <Stack.Screen name="GKAL" component={GKALScreen} />

        <Stack.Screen name="NAL" component={NaglibogScreen} />
        <Stack.Screen name="NAO" component={NagmugotScreen} />
        <Stack.Screen name="NHK" component={NahadlokScreen} />
        <Stack.Screen name="NALI" component={NalainScreen} />
        <Stack.Screen name="NALP" component={NalipayScreen} />
        <Stack.Screen name="NASK" component={NasukoScreen} />

        <Stack.Screen name="G12" component={G12Screen} />
        <Stack.Screen name="G13" component={G13Screen} />
        <Stack.Screen name="G14" component={G14Screen} />
        <Stack.Screen name="G15" component={G15Screen} />
        <Stack.Screen name="G16" component={G16Screen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({});
