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
  ActivityIndicator,
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
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Récupérer les données de profil si isComplete est true
  useEffect(() => {
    setLoading(true);
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
      setLoading(false);
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
      setUriImage(result.assets[0].uri);  // Màj l'URI de l'img
      setIsDefaultImage(false);
    } else {
      Alert.alert('Erreur', 'Seuls les fichiers .jpg sont autorisés.');
    }
  }
};

// Fonction pour supprimer l'image
const deleteImage = () => {
  setUriImage(null); // Réinitialiser l'URI de l'img
  setIsDefaultImage(true); // Revenir à l'img par défaut
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
    setLoading(true);
    try {
      const response = await fetch(imageUri);
      console.log("Image fetched successfully:", response);
      const blob = await response.blob();
      console.log("Blob created:", blob);
      const arrayBuffer = await new Response(blob).arrayBuffer();
      
      const { data, error } = await supabase.storage
        .from('ProfileImage')
        .upload(currentId, arrayBuffer, { 
          upsert:true,
        });
  
      if (error) {
        throw error;
      }
  
      // Retourne le chemin public de l'image
      return supabase.storage.from('ProfileImage').getPublicUrl(currentId).data.publicUrl;
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      throw error;
    }finally {
      setLoading(false);
    }
  };

  
  // Sauvegarder les informations dans Firebase
  const saveProfile = async () => {
    try {
      setLoading(true);
      // Validation des champs obligatoires
      if (!nom || !pseudo || !telephone) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs.");
        return;
      }
  
      let imageUri = uriImage;
      // Téléchargement de l'image sur Supabase si une image est fournie
      if (uriImage) {
        try {
          imageUri = await uploadImageToSupabase(uriImage);
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
      Alert.alert("Succès", "Profil enregistré avec succès !");
      // Redirection vers Home
      // props.navigation.replace("Home", { currentId });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des données :", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'enregistrement des données. Veuillez réessayer.");
    }finally {
      setLoading(false);
    }
  };
  

  
  return (
    <ImageBackground
      source={bg}
      style={styles.container}
    >
      {/* <StatusBar style="light" /> */}
      {loading && ( // Overlay when loading
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    )}
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
  container: {
    color: "blue",
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute", // Position absolute to overlay content
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Ensure it's above all content
  },
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
