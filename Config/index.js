// Import the functions you need from the SDKs you need
import app from "firebase/compat/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import "firebase/compat/auth"
import "firebase/compat/database"
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "whatsapp-21be8.firebaseapp.com",
  databaseURL: "https://whatsapp-21be8-default-rtdb.firebaseio.com",
  projectId: "whatsapp-21be8",
  storageBucket: "whatsapp-21be8.firebasestorage.app",
  messagingSenderId: "268566345520",
  appId: "1:268566345520:web:50a37b43253b6a04087af5",
  measurementId: "G-2EYGFRR0B7"
};

// Initialize Firebase
const firebase = app.initializeApp(firebaseConfig);


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xqctpsasmlovhbvuphgs.supabase.co"
const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

export default firebase;