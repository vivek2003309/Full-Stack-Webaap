import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseAppletConfig from "../../firebase-applet-config.json";

export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyA9CCfxn9T1LLPb3mbn6BSykzltIM-moME",
  authDomain: firebaseAppletConfig.authDomain || "ace-handler-j4dh4.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "ace-handler-j4dh4",
  storageBucket: firebaseAppletConfig.storageBucket || "ace-handler-j4dh4.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "222719050033",
  appId: firebaseAppletConfig.appId || "1:222719050033:web:b06c4209e2912523737010",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Connect specifically to the custom provisioned firestoreDatabaseId
const databaseId = firebaseAppletConfig.firestoreDatabaseId || "ai-studio-trehaninternatio-f71c84b2-99cc-4063-a6ca-3e2daa8bf6d2";
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
export default app;
