/**
 * Update Samy Chaffai's subcategories in production Firestore
 * Signs in with admin email/password via Firebase Auth REST API
 *
 * Run with: node scripts/update-samy-subcategories.js
 */

const https = require('https');
const readline = require('readline');

const API_KEY = 'AIzaSyC2P11O4HM--Gu8XaCV3lRgg-hqZ7qvV8g';
const PROJECT_ID = 'reviewhub-91cfb';

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => {
        const json = JSON.parse(raw);
        if (res.statusCode >= 400) reject(new Error(json.error?.message || raw));
        else resolve(json);
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function patch(url, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${token}`,
      },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => {
        const json = JSON.parse(raw);
        if (res.statusCode >= 400) reject(new Error(json.error?.message || raw));
        else resolve(json);
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans); }));
}

async function run() {
  const email = process.argv[2] || await prompt('Admin email: ');
  const password = process.argv[3] || await prompt('Admin password: ');

  console.log('Signing in...');
  const auth = await post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { email, password, returnSecureToken: true }
  );
  const token = auth.idToken;
  console.log('Signed in as', auth.email);

  // Firestore REST PATCH — updateMask limits which fields are touched
  const docPath = `projects/${PROJECT_ID}/databases/(default)/documents/businesses/influencer_samy_chaffai`;
  const updateUrl =
    `https://firestore.googleapis.com/v1/${docPath}` +
    `?updateMask.fieldPaths=subcategory_id` +
    `&updateMask.fieldPaths=subcategory_name` +
    `&updateMask.fieldPaths=sub_categories`;

  await patch(updateUrl, {
    fields: {
      subcategory_id:   { stringValue: 'content_creator' },
      subcategory_name: { stringValue: 'Content Creator' },
      sub_categories:   { arrayValue: { values: [
        { stringValue: 'content_creator' },
        { stringValue: 'filmmaker' },
      ]}},
    },
  }, token);

  console.log('Done — influencer_samy_chaffai updated.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
