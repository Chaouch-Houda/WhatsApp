import { StyleSheet } from "react-native";
import Authentification from "./Screens/Authentification";
import Chat from "./Screens/Chat";
import Home from "./Screens/Home";
import ListProfil from "./Screens/Home/ListProfil";
import MyProfil from "./Screens/Home/MyProfil";
import NewUser from "./Screens/NewUser";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaView  style={styles.safeArea}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Auth" component={Authentification} ></Stack.Screen>
        <Stack.Screen name="NewUser" component={NewUser}></Stack.Screen>
        <Stack.Screen name="Home" component={Home}></Stack.Screen>
        <Stack.Screen name="ListProfil" component={ListProfil}></Stack.Screen>
        <Stack.Screen name="Chat" component={Chat}></Stack.Screen>
        <Stack.Screen name="MyProfil" component={MyProfil}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
