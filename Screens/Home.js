import { View, Text, Alert, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import ListProfil from './Home/ListProfil'
import Groupe from './Home/Groupe';
import MyProfil from './Home/MyProfil';
import firebase from "../Config/index";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'

const Tab = createMaterialBottomTabNavigator();

export default function Home(props) {
  const currentId = props.route.params.currentId;
  const database = firebase.database();
  const ref_tableProfils = database.ref("TableDeProfils");

/****** fonction pour marquer l'utilisateur comme connecté lorsqu'il est en cours d'étuliser l'app, on a utiliser connected pour pouvoir l'accéder par les autres users, ils peuvent connaitre si je suis connecté ou pas******/ 
  const userStatusDatabaseRef = firebase.database().ref(`TableDeProfils/unprofil${currentId}/connected`);

  firebase.database().ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === true) {
      userStatusDatabaseRef.set(true); // Marquer comme connecté
      userStatusDatabaseRef.onDisconnect().set(false); // Définir comme déconnecté lorsqu'il quitte
    }
  });
  /******  Pour dériger le user vers MyProfil lorsque ses infos ne sont pas sauvegardées ******/ 
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

  /****** Fonction de déconnexion ******/ 
  const logout = async () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Logout cancelled"),
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: async () => {
    try {
      // Déconnexion de Firebase
      await firebase.auth().signOut()

      // Supprimer la session de l'utilisateur
      await AsyncStorage.removeItem('userSession')

      // Mettre à jour le statut "connected" dans Firebase
      const userStatusDatabaseRef = firebase.database().ref(`TableDeProfils/unprofil${currentId}/connected`)
      userStatusDatabaseRef.set(false)

      // Naviguer vers la page de connexion
      props.navigation.replace("Auth")
    } catch (error) {
      Alert.alert("Erreur", `Une erreur est survenue lors de la déconnexion.${error.message}`)
    }
  }
}
]
);
}
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size=20 }) => {
        // Ajouter les icônes pour chaque écran
        if (route.name === 'ListProfil') {
          return <Ionicons name="people-outline" size={size} color={color} />
        } else if (route.name === 'MyProfil') {
          return <Ionicons name="person-outline" size={size} color={color} />
        } else if (route.name === 'Groupe') {
          return <Ionicons name="chatbubbles-outline" size={size} color={color} />
        } else if (route.name === 'Logout') {
          return (
            <TouchableOpacity onPress={logout} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="log-out-outline" size={size} color={color} />
            </TouchableOpacity>
          )
        }
        return null
      },
    })}>
        <Tab.Screen name="ListProfil" component={ListProfil} initialParams={{currentId}}></Tab.Screen>
        <Tab.Screen name="MyProfil" component={MyProfil} initialParams={{currentId}}></Tab.Screen>
        <Tab.Screen name="Groupe" component={Groupe} initialParams={{currentId}}></Tab.Screen>

        {/* Déconnexion avec icône et texte sans écran */}
      <Tab.Screen
        name="Logout"
        component={() => null}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Empêche le changement d'écran
            logout(); // Appeler la fonction de déconnexion
          },
        }}
        // options={{
        //   tabBarButton: () => null, // Cache le bouton de tabBar pour la déconnexion
        // }}
      />
    </Tab.Navigator>
  )
}