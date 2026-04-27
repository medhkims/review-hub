/**
 * One-off script: pick 8 random businesses and set weekly_review_count = 1.
 * Uses Firestore REST API with Firebase CLI access token.
 */

const path = require('path');
const https = require('https');

const PROJECT_ID = 'reviewhub-91cfb';
const globalFirebaseTools = path.join(
  process.env.APPDATA || path.join(require('os').homedir(), 'AppData', 'Roaming'),
  'npm', 'node_modules', 'firebase-tools'
);

function getRefreshToken() {
  const { configstore } = require(path.join(globalFirebaseTools, 'lib', 'configstore.js'));
  const tokens = configstore.get('tokens');
  if (!tokens || !tokens.refresh_token) {
    throw new Error('No Firebase CLI tokens found. Run: npx firebase-tools login');
  }
  return tokens.refresh_token;
}

function getClientCredentials() {
  const api = require(path.join(globalFirebaseTools, 'lib', 'api.js'));
  return { clientId: api.clientId(), clientSecret: api.clientSecret() };
}

async function fetchAccessToken(refreshToken, clientId, clientSecret) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.access_token) resolve(json.access_token);
        else reject(new Error('Token error: ' + data));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function firestoreRequest(method, urlPath, accessToken, body) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents${urlPath}`;
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (_e) { reject(new Error(data)); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function listBusinesses(accessToken) {
  const results = [];
  let pageToken = '';
  do {
    const qs = pageToken ? `?pageSize=100&pageToken=${pageToken}` : '?pageSize=100';
    const resp = await firestoreRequest('GET', `/businesses${qs}`, accessToken);
    if (resp.documents) results.push(...resp.documents);
    pageToken = resp.nextPageToken || '';
  } while (pageToken);
  return results;
}

async function updateWeeklyCount(accessToken, docPath) {
  const url = `https://firestore.googleapis.com/v1/${docPath}?updateMask.fieldPaths=weekly_review_count`;
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify({
      fields: {
        weekly_review_count: { integerValue: '1' },
      },
    });
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (_e) { reject(new Error(data)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function seedTrending() {
  const refreshToken = getRefreshToken();
  const { clientId, clientSecret } = getClientCredentials();

  console.log('Getting access token...');
  const accessToken = await fetchAccessToken(refreshToken, clientId, clientSecret);
  console.log('Authenticated.');

  console.log('Fetching all businesses...');
  const docs = await listBusinesses(accessToken);
  console.log(`Found ${docs.length} businesses.`);

  if (docs.length === 0) {
    console.log('No businesses found. Nothing to do.');
    return;
  }

  // Shuffle and pick up to 8
  const shuffled = docs.sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, Math.min(8, docs.length));

  console.log(`Setting weekly_review_count = 1 for ${picked.length} businesses...`);

  for (const doc of picked) {
    const name = doc.fields?.name?.stringValue || doc.name.split('/').pop();
    await updateWeeklyCount(accessToken, doc.name);
    console.log(`  ✓ ${name}`);
  }

  console.log('Done!');
}

seedTrending().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
