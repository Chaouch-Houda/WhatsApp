import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { FlatList, Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { Linking } from "react-native";


import firebase from "../../Config";
const database = firebase.database();
const ref_tableProfils = database.ref("TableDeProfils");
import bg from "../../assets/background.jpg";

export default function ListProfil(props) {
  const currentId = props.route.params.currentId;
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState({})

  useEffect(() => {
      // ref_tableProfils.once() et ref_tableProfils.on() ijib les réferences dans cette table, différence once tjib mara brk w on tjib kol ma tsir ey modification fi réference
      // bich nzidou point l5a4ra (connected) lkol we7id fi list

    // Use `on` to listen to changes in the database
    const onValueChange = ref_tableProfils.on("value",(snapshot) => {
      const d = [];
      snapshot.forEach((unprofil)=> {
        // console.log("🚀 ~ snapshot.forEach ~ unprofil.val():", unprofil.val())
        if(unprofil.val().id == currentId)
          { 
            setCurrentUser(unprofil.val());
        // console.log("🚀 ~ snapshot.forEach ~ currentId:", currentId)
          }
        else
          d.push(unprofil.val());
      })
      setData(d);
  })
  
    return () => { // execute kif tsakir lpage
      ref_tableProfils.off("value", onValueChange); }
  }, []) // [] execute pour le 1er runder, si vide 
  
  const handleCall = (phoneNumber) => {
    if (!phoneNumber) {
      console.log("Numéro de téléphone manquant !");
      return;
    }
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          console.log("Le téléphone ne supporte pas les appels !");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error("Erreur lors de l'ouverture de l'appel :", err));
  };
  
  
  return (
    <ImageBackground
      source={bg}
      style={[styles.container, { opacity: 1 }]}
    >
      <StatusBar style="dark" />
      <Text style={styles.textstyle}>List profils</Text>
      <FlatList
      data={data}
      keyExtractor={(item) => item.id?.toString()} // Ensure each item has a unique key
      renderItem={({item})=> {
        return (
          <View style={styles.itemStyle}>
            <Image
              source={{ uri: item.uriImage || "https://via.placeholder.com/50" }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginRight: 10,
              }}
            />
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 16 }}>
                {item.nom}
              </Text>
              <Text style={{ color: "#ccc", fontSize: 14 }}>{item.pseudo}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Icône d'appel */}
              <Text
                style={{
                  marginRight: 10,
                  color: "#007BFF",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
                onPress={() => handleCall(item.telephone)}
              >
                📞
              </Text>

              {/* Icône de redirection */}
              <Text
                style={{
                  color: "#007BFF",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
                onPress={() => {
                  console.log("currentUser",currentUser);
                  console.log("item",item);
                  props.navigation.navigate("Chat", {
                    currentUser: currentUser,
                    secondUser: item,
                  });
                }}
              >
                💬
              </Text>
            </View>
            </View>
        )
      }}
      style={{
        width:"95%",
      }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  textinputstyle: {
    fontWeight: "bold",
    backgroundColor: "#0004",
    fontSize: 20,
    color: "#fff",
    width: "75%",
    height: 50,
    borderRadius: 10,
    margin: 5,
  },
  textstyle: {
    fontSize: 40,
    fontFamily: "serif",
    color: "#ca6be6",
    fontWeight: "bold",
    paddingTop: 45,
  },
  container: {
    color: "blue",
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  itemStyle:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0005",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  }
});