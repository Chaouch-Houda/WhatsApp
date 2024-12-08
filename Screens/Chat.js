import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from '../Config';

const database = firebase.database();
const ref_lesMessages = database.ref("Discussions");

export default function Chat(props) {
  const currentUser = props.route.params.currentUser;
  const secondUser = props.route.params.secondUser;

  // Construction de l'id unique de la discussion
  const idDisc = currentUser.id > secondUser.id 
                ? currentUser.id + secondUser.id
                : secondUser.id + currentUser.id; 

  const ref_uneDisc = ref_lesMessages.child(idDisc);

  const [message, setMessage] = useState(''); // Message actuel en cours de saisie dans TextInput
  const [data, setData] = useState([]);     // liste des messages de cette discussion
  
  const [secondIsTyping, setSecondIsTyping] = useState(false);

  useEffect(() => {
    ref_uneDisc.on("value", (snapshot) => {
      let d = [];
      snapshot.forEach((unmsg) => {
        const message = unmsg.val();
        // Vérifie si le nœud actuel est un message valide, pour ne met pas les ref de {id}IsWriting
        if (
          message.body && 
          message.sender &&
          message.receiver &&
          message.time 
      ) {
          d.push(message);
      }
      });
      if (!currentUser?.id || !secondUser?.id) {
        console.error("Invalid user data:", { currentUser, secondUser });
        Alert.alert("Erreur", "Les informations de l'utilisateur sont incorrectes.");
        return;
      }
      
      setData(d.reverse()); // Inverse les messages pour afficher du plus récent au plus ancien
    });

    return () => {
      ref_uneDisc.off();
    };
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Le message ne peut pas être vide.');
      return;
    }

    const key = ref_uneDisc.push().key; // Génère une clé unique pour le message
    const ref_unMessage = ref_uneDisc.child(key);

    ref_unMessage
      .set({
        body: message,
        time: new Date().toLocaleString(),
        sender: currentUser.id,
        receiver: secondUser.id,
      })
      .then(() => {
        setMessage('');
      })
      .catch((error) => {
        Alert.alert('Erreur', 'Impossible d’envoyer le message. Veuillez réessayer.');
        console.error(error);
      });
  };


//   ****************************************** handle Typing ********************************************
  useEffect(() => {
    return () => {
      handleTyping(false);
    };
  }, []);
  
// Observer l'état isTyping du secondUser : en observant le champ {secondUser.id}IsTyping.
  useEffect(() => {
    const secondTypingRef = ref_uneDisc.child(`${secondUser.id}IsTyping`);
  
    // Écouter les changements pour le second utilisateur
    secondTypingRef.on('value', (snapshot) => {
      setSecondIsTyping(snapshot.val() || false);
    });
  
    return () => {
      secondTypingRef.off();
    };
  }, [ref_uneDisc, secondUser.id, currentUser.id]);
  
  //Màj l'état isTyping de currentUser : en utilisant currentId + "IsTyping" pour le champ correspondant.
  const handleTyping = (isTyping) => {
    const currentTypingRef = ref_uneDisc.child(`${currentUser.id}IsTyping`);
    currentTypingRef.set(isTyping).catch((error) => {
      console.error('Erreur lors de la mise à jour de isTyping :', error);
    });
  };
  

  
  return (
    // j'utilise TouchableWithoutFeedback pour gérer les clics en dehors de la zone de saisie pour fermer le clavier et réinitialiser "isTyping"
    <TouchableWithoutFeedback
    onPress={() => {
      Keyboard.dismiss(); // Ferme le clavier
      handleTyping(false); // Réinitialise isTyping
    }}
  >
    <View style={styles.container}>
      <View style={styles.headerView}>
        <TouchableOpacity
          onPress={() => props.navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{secondUser.nom}</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {const isCurrentUser = item.sender === currentUser.id;
          return (
            <View
              style={[
                styles.messageContainer,
                isCurrentUser ? styles.currentUserMessage : styles.secondUserMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.body}</Text>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
          );
        }}
        contentContainerStyle={styles.messagesList}
        inverted
      />
      {secondIsTyping && (
          <Text style={styles.typingText}> {secondUser.nom} is typing...</Text>
      )}


      {/* Section Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80} // Décalage pour éviter la superposition sinon view de input devient mal stylisé lorsqu'on ouvre le clavier 
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              handleTyping(true);
            }}
            onFocus={() => handleTyping(true)}
            onBlur={() => handleTyping(false)}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerView: {
    padding: 10,
    backgroundColor: '#e6e6e6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    backgroundColor: '#e6e6e6',
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#cae8fc', // Couleur pour mes messages
  },
  secondUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6e6e6', // Couleur pour les messages de le secondUser
  },
  messageText: {
    color: '#333',
    fontSize: 16,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'flex-end', // Maintains the input section at the bottom
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  sendButton: {
    // backgroundColor: '#007BFF',
    backgroundColor: "#ca6be6",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
