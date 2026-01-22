require('dotenv').config();
const fetch = require('node-fetch'); // npm i node-fetch

const apiKey = process.env.FIREBASE_WEB_API_KEY;
const email = process.env.FIREBASE_TEST_EMAIL;
const password = process.env.FIREBASE_TEST_PASSWORD;

(async () => {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const data = await res.json();
    console.log(data);

    const me = await fetch('http://localhost:3000/auth/me', {
        headers: {
            Authorization: `Bearer ${data.idToken}`,
        },
    });

    console.log("response localhost:3000/auth/me: ", await me.json());
})();
