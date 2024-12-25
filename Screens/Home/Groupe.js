import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  Image 
} from 'react-native';
import firebase from '../../Config/index';

const database = firebase.database();

export default function Groupe(props) {
  const currentId = props.route.params?.currentId;
  const [currentUser, setCurrentUser] = useState({});
  const [users, setUsers] = useState({});
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const ref_tableProfils = database.ref("TableDeProfils");
  
  if (!currentId) {
    console.error("L'ID de l'utilisateur courant (currentId) est indéfini ou manquant.");
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Erreur : l'ID de l'utilisateur courant est manquant.
        </Text>
      </View>
    );
  }

  // Créer ou récupérer le groupe "par défaut"
  useEffect(() => {
    const refGroup = database.ref("Groupes");
    
    refGroup.once('value', snapshot => {
      if (!snapshot.exists()) {
        const defaultGroupId = 'default-group';
        setGroupId(defaultGroupId);

        // Créer le groupe et y ajouter les utilisateurs
        const refProfiles = database.ref("TableDeProfils");
        refProfiles.once('value', profilesSnapshot => {
          let usersData = {};
          profilesSnapshot.forEach(childSnapshot => {
            const user = childSnapshot.val();
            usersData[user.id] = user; // Stocker les données de chaque utilisateur
            if (user.id === currentId) {
              setCurrentUser(user);
            }
            database.ref(`Groupes/${defaultGroupId}/users`).push(user.id);
          });
          setUsers(usersData); // Mettre à jour les utilisateurs
          console.log('users data', usersData); // Vérifiez ici les utilisateurs chargés
        });

        database.ref(`Groupes/${defaultGroupId}/messages`).set([]);
      } else {
        const existingGroupId = snapshot.key;
        setGroupId(existingGroupId);
      }
    });

    return () => {
      refGroup.off();
    };
  }, [currentId]);

  // Récupérer les messages du groupe
  useEffect(() => {
    if (!groupId) return;

    const refMessages = database.ref(`Groupes/${groupId}/messages`);
    refMessages.on("value", snapshot => {
      const msgList = [];
      snapshot.forEach(childSnapshot => {
        const message = childSnapshot.val();
        msgList.push(message);
      });
      setMessages(msgList.reverse()); // Inverser pour avoir les messages récents en bas
    });

    return () => {
      refMessages.off();
    };
  }, [groupId]);

  const handleSendMessage = () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Le message ne peut pas être vide.');
      return;
    }

    const refMessages = database.ref(`Groupes/${groupId}/messages`);
    const newMessageKey = refMessages.push().key;

    refMessages.child(newMessageKey).set({
      sender: currentId,
      body: message,
      time: new Date().toLocaleString(),
    })
    .then(() => {
      setMessage('');
    })
    .catch(error => {
      Alert.alert('Erreur', 'Impossible d’envoyer le message. Veuillez réessayer.');
      console.error(error);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Groupe de Discussion</Text>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const senderInfo = users[item.sender]; // Vérifiez si l'expéditeur est bien dans l'état des utilisateurs
          const isCurrentUser = item.sender === currentId;
          console.log("🚀 ~ Groupe ~ senderInfo:", senderInfo);

          // Si 'senderInfo' n'est pas défini, affichez un utilisateur inconnu
          const senderName = senderInfo ? senderInfo.pseudo : 'Utilisateur inconnu'; // Utilisez "pseudo" au lieu de "username"

          return (
            <View style={{
              flexDirection: isCurrentUser ? 'row-reverse' : 'row', // Inverser l'ordre pour `currentUser`
              alignItems: "start", paddingTop: 20
            }}>
              <Image
                source={{ uri: senderInfo?.uriImage || "https://via.placeholder.com/50" }}
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: 25,
                  marginRight: 3,
                }}
              />
              <View 
                style={[
                  styles.messageContainer, 
                  isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
                ]}
              >
                {/* Affichage du pseudo de l'expéditeur */}
                <Text style={styles.senderName}>{senderName}</Text>
                <View style={styles.messageContent}>
                  <Text style={styles.messageText}>{item.body}</Text>
                  <Text style={styles.messageTime}>{item.time}</Text>
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
        inverted // Permet d'afficher les messages récents en bas
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputWrapper}
      >
        <TextInput
          style={styles.textInput}
          placeholder="Tapez un message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  messageContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#cae8fc',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6e6e6',
  },
  messageContent: {
    flexDirection: 'column',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
  },
  messageTime: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
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
    backgroundColor: "#ca6be6",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 14,
    color: '#333',
  },
});
