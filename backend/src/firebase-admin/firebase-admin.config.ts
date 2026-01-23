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
    console.log('🔥 Firebase Storage bucket:', process.env.FIREBASE_STORAGE_BUCKET);
  console.log('🔥 Firebase init called===========8989==');
  console.log({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
  });
    console.log(
      process.env.FIREBASE_PRIVATE_KEY?.startsWith('-----BEGIN')
    );

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
  } else {
    app = admin.app();
  }

  return app;
}
