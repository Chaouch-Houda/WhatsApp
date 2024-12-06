
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableHighlight,
} from "react-native";

import firebase from "../Config";
const auth = firebase.auth();

export default function Authentification(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const refInput2 = useRef();
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

        <TouchableHighlight
          style={styles.button}
            onPress={() => {
              if (!email || !password) {
                alert("Veuillez entrer votre email et mot de passe.");
                return;
              }

              auth.signInWithEmailAndPassword(email,password).then(()=>{
                const currentId = auth.currentUser.uid;
                props.navigation.replace("Home",{currentId:currentId});
              })
              .catch((error) => {
                  alert(error.message);
              })
          }}
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
