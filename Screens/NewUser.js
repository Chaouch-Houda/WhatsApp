import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  BackHandler,
  TouchableHighlight,
} from "react-native";

import firebase from "../Config";
const auth = firebase.auth();
const database = firebase.database();

export default function NewUser(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const refInput2 = useRef();
  const refInput3 = useRef();

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <ImageBackground
        style={styles.background}
        source={require("../assets/background.jpg")}
      >
        <Image source={require("../assets/logo.png")} style={styles.logo} />

        <Text style={styles.title}>Bienvenue</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          placeholderTextColor="#888"
          onChangeText={(text) => {
            setEmail(text);
          }}
          onSubmitEditing={() => {
            refInput2.current.focus();
          }}
        />

        <TextInput
          placeholder="Mot de passe"
          style={styles.input}
          secureTextEntry={true}
          placeholderTextColor="#888"
          ref={refInput2}
          onChangeText={(text) => {
            setPassword(text);
          }}
          onSubmitEditing={() => {
            refInput3.current.focus();
          }}
        />

        <TextInput
          placeholder="Confirmer mot de passe"
          style={styles.input}
          secureTextEntry={true}
          placeholderTextColor="#888"
          ref={refInput3}
          onChangeText={(text) => {
            setConfirmPassword(text);
          }}
        />

        <TouchableHighlight
          style={styles.button}
          onPress={() => {
            if (password !== confirmPassword) {
              alert("Les mots de passe ne correspondent pas.");
              return;
            }
            auth
            .createUserWithEmailAndPassword(email,password)
            .then((userCredential)=>{
              const currentId = userCredential.user.uid;
              // Ajouter une entrée dans Table de profils
              database.ref(`TableDeProfils/${currentId}`).set({
                isComplete: false, // Indique que le profil est incomplet
              });
              props.navigation.replace("MyProfil",{currentId});
            })
            .catch((error) => {
                alert(error.message);
            })
          }}
        >
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableHighlight>
        
        <View style={{flex:1, flexDirection:"row", justifyContent: "center", alignItems: "center"}}>
            <Text>Vous avez déjà un compte ?</Text>
            <TouchableHighlight
              style={styles.secondButton}
              onPress={() => {
                props.navigation.replace("Auth");
              }}
            >
              <Text>Se Connecter</Text>
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
  rowContainer: {
    flexDirection: 'row', 
    alignItems: 'center',      
    justifyContent: 'center',   
    marginTop: 20,               
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
    marginTop:60,
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
    padding: 6,
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
