import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: 'AIzaSyCnAjEUNqOfwXd-ZbaMWxLG2elZItlWNZE',
  authDomain: 'ai-file-processor-8d09e.firebaseapp.com',
  projectId: 'ai-file-processor-8d09e',
  storageBucket: 'ai-file-processor-8d09e.firebasestorage.app',
  messagingSenderId: '504718628834',
  appId: '1:504718628834:web:8dddd9dcd2326973734bbb',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
