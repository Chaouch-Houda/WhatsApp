import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from '../Config';

const database = firebase.database();
const ref_lesMessages = database.ref("Discussions");

export default function Chat(props) {
  const currentUser = props.route.params.currentUser;
  const secondUser = props.route.params.secondUser;
  const idDisc = currentUser.id > secondUser.id 
                ? currentUser.id + secondUser.id
                : secondUser.id + currentUser.id; 

  const ref_uneDisc = ref_lesMessages.child(idDisc);
  const [message, setMessage] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    ref_uneDisc.once("value", (snapshot) => {
      let d = [];
      snapshot.forEach((unmsg) => {
        d.push(unmsg.val());
      });
      setData(d);
    });

    return () => {
      ref_uneDisc.off();
    };
  }, []);

  return (
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
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{item.body}</Text>
            <Text style={styles.messageText}>{item.time}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
        inverted
      />

      {/* Section Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              const key = ref_uneDisc.push().key;
              const ref_unMessage = ref_uneDisc.child(key);
              ref_unMessage.set({
                body: message,
                time: new Date().toLocaleString(),
                sender: currentUser.id,
                receiver: secondUser.id
              });
            }}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
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
