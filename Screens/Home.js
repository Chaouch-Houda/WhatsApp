import { View, Text, Alert } from 'react-native'
import React, { useEffect } from 'react'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import ListProfil from './Home/ListProfil'
import Groupe from './Home/Groupe';
import MyProfil from './Home/MyProfil';
import firebase from "../Config/index";

const Tab = createMaterialBottomTabNavigator();
export default function Home(props) {
  const currentId = props.route.params.currentId;
  const database = firebase.database();
  const ref_tableProfils = database.ref("TableDeProfils");

  useEffect(() => {
    const ref_unprofil = ref_tableProfils.child("unprofil" + currentId);
  
    ref_unprofil.child("isComplete").once("value", (snapshot) => {
      const isComplete = snapshot.val();
      if (!isComplete) {
        Alert.alert(
          "Profil incomplet",
          "Veuillez compléter votre profil avant de continuer.",
          [
            {
              text: "OK",
              onPress: () => props.navigation.replace("MyProfil", { currentId }),
            },
          ]
        );
      }
    });
  }, [currentId]);
  
  return (
    <Tab.Navigator>
        <Tab.Screen name="ListProfil" component={ListProfil} initialParams={{currentId}}></Tab.Screen>
        <Tab.Screen name="MyProfil" component={MyProfil} initialParams={{currentId}}></Tab.Screen>
        <Tab.Screen name="Groupe" component={Groupe} initialParams={{currentId}}></Tab.Screen>
    </Tab.Navigator>
  )
}