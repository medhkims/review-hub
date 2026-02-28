import { createRequire } from 'module';
import https from 'https';
const require = createRequire(import.meta.url);

const Configstore = require('C:/Users/ASUS/AppData/Roaming/npm/node_modules/firebase-tools/node_modules/configstore');
const api = require('C:/Users/ASUS/AppData/Roaming/npm/node_modules/firebase-tools/lib/api');

const conf = new Configstore('firebase-tools');
const refreshToken = conf.get('tokens').refresh_token;

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Step 1: Get fresh access token
const tokenPostBody = new URLSearchParams({
  client_id: api.clientId(),
  client_secret: api.clientSecret(),
  grant_type: 'refresh_token',
  refresh_token: refreshToken,
}).toString();

const tokenRes = await httpsRequest({
  hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(tokenPostBody) }
}, tokenPostBody);

const access_token = tokenRes.body.access_token;
if (!access_token) { console.error('No token:', tokenRes.body); process.exit(1); }
console.log('Got fresh access token');

// Step 2: List Firebase Storage buckets
const bucketsRes = await httpsRequest({
  hostname: 'firebasestorage.googleapis.com',
  path: '/v1beta/projects/reviewhub-91cfb/buckets',
  headers: { Authorization: 'Bearer ' + access_token }
});
console.log('Buckets response:', bucketsRes.status, JSON.stringify(bucketsRes.body));

const buckets = bucketsRes.body.buckets || [];
if (!buckets.length) { console.error('No buckets found'); process.exit(1); }

// Step 3: Apply CORS to each bucket via GCS API
for (const b of buckets) {
  const bucketId = b.name.split('/buckets/')[1];
  console.log('Applying CORS to bucket:', bucketId);

  const corsBody = JSON.stringify({
    cors: [{
      origin: ['*'],
      method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
      responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
      maxAgeSeconds: 3600,
    }],
  });

  const corsRes = await httpsRequest({
    hostname: 'storage.googleapis.com',
    path: '/storage/v1/b/' + bucketId + '?fields=cors',
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer ' + access_token,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(corsBody),
    }
  }, corsBody);

  console.log('CORS result (' + corsRes.status + '):', JSON.stringify(corsRes.body, null, 2));
}
