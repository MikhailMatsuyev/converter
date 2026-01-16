import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (app) {
    return app;
  }
  // if (process.env.NODE_ENV !== 'production') {
  //   throw new Error(
  //     'Firebase Admin is disabled outside production environment'
  //   );
  // }

  if (admin.apps.length === 0) {
  console.log('🔥 Firebase init called===============8989==');
  console.log({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
  });

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
  } else {
    app = admin.app();
  }

  return app;
}



// import * as admin from 'firebase-admin';
// import { ServiceAccount } from 'firebase-admin';
//
// // let firebaseApp: admin.app.App;
//
// export function getFirebaseApp(): admin.app.App {
//   if (admin.apps.length > 0) {
//     return admin.app();
//   }
//
//     return  admin.initializeApp({
//       credential: admin.credential.cert({
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//       } as ServiceAccount),
//       storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//     });
// }
//
// export function getFirebaseAuth(): admin.auth.Auth {
//   return getFirebaseApp().auth();
// }

// import * as admin from 'firebase-admin';
// import * as path from 'path';
// import * as fs from 'fs';
//
// export function initializeFirebaseAdmin() {
//   if (admin.apps.length === 0) {
//     try {
//       // Путь в Docker контейнере (после добавления volume)
//       const dockerPath = '/app/firebase/ai-file-processor-8d09e-firebase-adminsdk-fbsvc-d92355ccbd.json';
//
//       // Путь при локальной разработке (без Docker)
//       const localPath = path.join(__dirname, '../../../../firebase/ai-file-processor-8d09e-firebase-adminsdk-fbsvc-d92355ccbd.json');
//
//       let serviceAccountPath: string;
//
//       // Проверяем какой путь существует
//       if (fs.existsSync(dockerPath)) {
//         serviceAccountPath = dockerPath;
//         console.log('✅ Using Firebase config from Docker volume:', dockerPath);
//       } else if (fs.existsSync(localPath)) {
//         serviceAccountPath = localPath;
//         console.log('✅ Using Firebase config from local path:', localPath);
//       } else {
//         throw new Error(`Firebase config not found. Checked:
//           - Docker: ${dockerPath}
//           - Local: ${localPath}`);
//       }
//
//       const serviceAccount = require(serviceAccountPath);
//
//       admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//         storageBucket: `${serviceAccount.project_id}.appspot.com`,
//       });
//
//       console.log('✅ Firebase Admin initialized successfully');
//     } catch (error) {
//       console.error('❌ Firebase Admin initialization failed:', error.message);
//
//       // В dev режиме используем fallback с переменными окружения
//       if (process.env.NODE_ENV === 'development') {
//         console.warn('⚠️ Falling back to environment variables for development');
//
//         const serviceAccount = {
//           projectId: process.env.FIREBASE_PROJECT_ID,
//           privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//           clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         };
//
//         if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
//           admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount),
//             storageBucket: `${serviceAccount.projectId}.appspot.com`,
//           });
//           console.log('✅ Firebase Admin initialized from environment variables');
//         }
//       } else {
//         // В production падаем
//         throw error;
//       }
//     }
//   }
//   return admin;
// }
