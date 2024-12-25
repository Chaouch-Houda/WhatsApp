
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableHighlight,
  Alert,
} from "react-native";

import firebase from "../Config";
const auth = firebase.auth();
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from "react-native-paper";


export default function Authentification(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stayConnected, setStayConnected] = useState(false);
  const refInput2 = useRef();

  // Vérifier si l'utilisateur est déjà connecté s'il a choisit "rester connecté", il est géré par les sessions
  useEffect(() => {
    const checkUserSession = async () => {
      const userId = await AsyncStorage.getItem("userSession");
      if (userId) {
        props.navigation.replace("Home", { currentId: userId });
      }
    };
    checkUserSession();
  }, []);

const saveUserSession = async (userId) => {
  try {
    await AsyncStorage.setItem('userSession', userId);
    const test = await AsyncStorage.getItem('userSession');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la session :', error);
  }
};


  const login = () => {
    if (!email || !password) {
      alert("Veuillez entrer votre email et mot de passe.");
      return;
    }

    auth
    .signInWithEmailAndPassword(email,password)
    .then((userCredential)=>{
      const currentId = userCredential.user.uid;
      props.navigation.replace("Home",{currentId});
      // Sauvegarder les informations si "Rester connecté" est coché
      if (stayConnected) {
        saveUserSession(currentId);
      }
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        // Gestion des erreurs courantes
        if (errorCode === "auth/wrong-password") {
          Alert.alert("Error", "Incorrect password, please try again.");
        } else if (errorCode === "auth/user-not-found") {
          Alert.alert("Error", "No user found with this email.");
        } else {
          Alert.alert("Error", errorMessage);
        }
    })
}

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <ImageBackground
        style={styles.background}
        source={require("../assets/background.jpg")}
      >
        <Image source={require("../assets/logo.png")} style={styles.logo} />

        <Text style={styles.title}>Connexion</Text>

        <TextInput
          onChangeText={(text) => {
            setEmail(text);
          }}
          onSubmitEditing={() => {
            refInput2.current.focus();
          }}
          placeholder="Email"
          style={styles.input}
          keyboardType="email"
          placeholderTextColor="#888"
        />

        <TextInput
          onChangeText={(text) => {
            setPassword(text);
          }}
          placeholder="Mot de passe"
          style={styles.input}
          secureTextEntry={true}
          placeholderTextColor="#888"
          ref={refInput2}
        />
        <View style={{display:'flex', alignItems:'center', flexDirection:'row',justifyContent:'start',width:'100%',marginLeft:'90'}}>
        <Checkbox
            status={stayConnected ? "checked" : "unchecked"}
            onPress={() => setStayConnected(!stayConnected)}
          />

          <Text>Rester connecté</Text>
        </View>
        <TouchableHighlight
          style={styles.button}
            onPress={() => login()}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableHighlight>

        <View style={{ display:"flex", flexDirection:"row",justifyContent: "center", alignItems: "center" }}>
          <Text>Vous n'avez pas de compte ?</Text>
          <TouchableHighlight
            style={styles.secondButton}
            onPress={() => {
              props.navigation.replace("NewUser");
            }}
          >
            <Text>S'inscrire</Text>
          </TouchableHighlight>
    </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#624E88",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    borderColor: "#ddd",
    borderRadius: 30,
  },
  button: {
    width: "40%",
    padding: 6,
    paddingVertical: 15,
    backgroundColor: "#ca6be6",
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  secondButton:{
    padding: 20,
    paddingVertical: 13,
    marginLeft: 10,
    marginBottom: 20,
    backgroundColor: "#EEEEEE",
    borderColor:"#ca6be6",
    borderWidth:1.5,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    fontWeight:'800',
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
