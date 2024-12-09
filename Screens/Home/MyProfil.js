import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import firebase from "../../Config";
import { supabase } from "../../Config";
import profile from "../../assets/profile.jpg";
import bg from "../../assets/background.jpg";

const database = firebase.database();
const ref_tableProfils = database.ref("TableDeProfils");

export default function MyProfil(props) {
  const currentId = props.route.params?.currentId;

  const [nom, setNom] = useState();
  const [pseudo, setpseudo] = useState();
  const [telephone, setTelephone] = useState();
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [uriImage, setUriImage] = useState(null);

  // Récupérer les données de profil si isComplete est true
  useEffect(() => {
    const ref_unprofil = ref_tableProfils.child(`unprofil${currentId}`);

    ref_unprofil.once("value", (snapshot) => {
      const data = snapshot.val();
      if (data && data.isComplete) {
        setNom(data.nom || "");
        setpseudo(data.pseudo || "");
        setTelephone(data.telephone || "");
        setUriImage(data.uriImage || null);
        setIsDefaultImage(!data.uriImage); // Vérifiez si une image personnalisée existe
      }
    });
  }, [currentId]);

 // Fonction pour choisir une image dans la galerie
 const pickImage = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
    Alert.alert("Permission requise", "Vous devez autoriser l'accès à la galerie.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1], // Aspect carré pour l'image
    quality: 1, // Haute qualité
  });

  if (!result.canceled) {
    const fileExtension = result.assets[0].uri.split('.').pop().toLowerCase();

    if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      setUriImage(result.assets[0].uri);  // Mettre à jour l'URI de l'image
      setIsDefaultImage(false);
    } else {
      Alert.alert('Erreur', 'Seuls les fichiers .jpg sont autorisés.');
    }
  }
};

// Fonction pour supprimer l'image
const deleteImage = () => {
  setUriImage(null); // Réinitialiser l'URI de l'image
  setIsDefaultImage(true); // Revenir à l'image par défaut
};

   // Fonction pour télécharger l'image sur Supabase
  //  const uploadImageToSupabase = async (uri) => {
  //   try {
  //     const fileExtension = uri.split('.').pop(); 
  //     const fileName = `${Date.now()}.${fileExtension}`;
  //     const response = await fetch(uri);  // Obtenez le fichier depuis l'URI
  //     const blob = await response.blob();  // Convertir l'URI en Blob
  //     const { data, error } = await supabase.storage
  //       .from("ProfileImage") // Assurez-vous que vous avez un bucket "ProfileImage"
  //       .upload(fileName, blob, {
  //         cacheControl: "3600",
  //         upsert: true,
  //       });

  //     if (error) {
  //       throw error;
  //     }
  //     console.log("Image uploaded successfully:", data);
  //     return data.path; // Retourner le chemin du fichier téléchargé dans Supabase
  //   } catch (error) {
  //     console.error("Erreur lors du téléchargement de l'image sur Supabase:", error);
  //     Alert.alert("Erreur", "Une erreur est survenue lors du téléchargement de l'image.");
  //     return null;
  //   }
  // };

  const uploadImageToSupabase = async (imageUri) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
  
      const { data, error } = await supabase.storage
        .from('avatars') // Nom de votre bucket
        .upload(`public/${Date.now()}-${currentId}.jpg`, blob, {
          contentType: 'image/jpeg',
        });
  
      if (error) {
        throw error;
      }
  
      // Retourne le chemin public de l'image
      return supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      throw error; // Relancer l'erreur pour qu'elle soit capturée dans saveProfile
    }
  };

  
  // Sauvegarder les informations dans Firebase
  const saveProfile = async () => {
    try {
      // Validation des champs obligatoires
      if (!nom || !pseudo || !telephone) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs.");
        return;
      }
  
      let imageUri = uriImage;
  
      // Téléchargement de l'image sur Supabase si une image est fournie
      if (uriImage) {
        console.log("Téléchargement de l'image...");
        try {
          imageUri = await uploadImageToSupabase(uriImage); // Assurez-vous que cette fonction est bien implémentée
        } catch (uploadError) {
          console.error("Erreur lors du téléchargement de l'image :", uploadError);
          Alert.alert("Erreur", "Échec du téléchargement de l'image. Veuillez réessayer.");
          return;
        }
      }
  
      // Référence à la table Firebase
      const ref_unprofil = ref_tableProfils.child(`unprofil${currentId}`);
  
      // Enregistrement des données
      await ref_unprofil.set({
        id: currentId,
        nom,
        pseudo,
        telephone,
        uriImage: imageUri || "", // Chemin de l'image ou chaîne vide
        isComplete: true,
      });
  
      console.log("Données enregistrées avec succès!");
  
      // Redirection vers Home
      props.navigation.replace("Home", { currentId });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des données :", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'enregistrement des données. Veuillez réessayer.");
    }
  };
  

  
  return (
    <ImageBackground
      source={bg}
      style={styles.container}
    >
      {/* <StatusBar style="light" /> */}
      <Text style={styles.textstyle}>My profile</Text>
      <View>
        <TouchableHighlight onPress={pickImage} style={styles.imageWrapper}>
          <Image
            source={isDefaultImage ? profile : { uri: uriImage }}
            style={styles.profileImage}
          />
        </TouchableHighlight>
        {/* Icone de poubelle */}
        {!isDefaultImage && (
          <TouchableOpacity style={styles.deleteIcon} onPress={deleteImage}>
            <MaterialIcons name="delete" size={25} color="white"/>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        value={nom}
        onChangeText={(text) => setNom(text)}
        textAlign="start"
        placeholderTextColor="#EEEEEE"
        placeholder="Nom"
        keyboardType="name-phone-pad"
        style={styles.textinputstyle}
        paddingHorizontal="15"
      />
      <TextInput
        value={pseudo} 
        onChangeText={(text) => setpseudo(text)}
        textAlign="start"
        placeholderTextColor="#EEEEEE"
        placeholder="Pseudo"
        keyboardType="name-phone-pad"
        style={styles.textinputstyle}
        paddingHorizontal="15"
      />
      <TextInput
        value={telephone} 
  onChangeText={(text) => setTelephone(text)}
  placeholderTextColor="#EEEEEE"
  textAlign="start"
  placeholder="Numéro"
  style={styles.textinputstyle}
  paddingHorizontal="15"
/>


      <TouchableHighlight
        onPress={saveProfile}
        activeOpacity={0.5}
        underlayColor="#ca6be6"
        style={{
          marginBottom: 10,
          borderColor: "#ca6be6",
          borderWidth: 2,
          backgroundColor: "#ca6be6",
          textstyle: "italic",
          fontSize: 18,
          // height: 60,
          // width: "40%",
          paddingVertical:10,
          paddingHorizontal:12,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 18,
          marginTop: 20,
        }}
      >
        <Text
          style={{
            color: "#FFF",
            fontSize: 18,
          }}
        >
          Enregistrer
        </Text>
      </TouchableHighlight>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    height: 150,
    width: 150,
    marginVertical: 20,
    borderRadius: 100,
  },
  profileImage: {
    height: 150,
    width: 150,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#babec0"

  },
  viewImage:{
    height: 200,
    width: 200,
    borderRadius: 100,
    // position:"relative",
  },
  deleteIcon: {
    position: "absolute",
    bottom: 10,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 5,
    borderRadius: 25,
  },
  textstyle: {
    fontSize: 30,
    fontFamily: "serif",
    color: "#ca6be6",
    fontWeight: "bold",
  },
  container: {
    color: "blue",
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textinputstyle: {
    fontWeight: "bold",
    backgroundColor: "rgba(186,190,192,0.8)",
    fontSize: 16,
    width: "75%",
    height: 50,
    borderRadius: 10,
    margin: 5,
  },
});
