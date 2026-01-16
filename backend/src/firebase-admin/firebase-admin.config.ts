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
  console.log('🔥 Firebase init called===========8989==');
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
