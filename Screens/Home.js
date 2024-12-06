import { View, Text } from 'react-native'
import React from 'react'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import ListProfil from './Home/ListProfil'
import Groupe from './Home/Groupe';
import MyProfil from './Home/MyProfil';

const Tab = createMaterialBottomTabNavigator();
export default function Home(props) {
  const currentId = props.route.params.currentId;
  return (
    <Tab.Navigator>
        <Tab.Screen name="ListProfil" component={ListProfil} initialParams={{currentId: currentId}}></Tab.Screen>
        <Tab.Screen name="MyProfil" component={MyProfil} initialParams={{currentId: currentId}}></Tab.Screen>
        <Tab.Screen name="Groupe" component={Groupe} initialParams={{currentId: currentId}}></Tab.Screen>
    </Tab.Navigator>
  )
}