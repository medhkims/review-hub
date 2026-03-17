const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const path = require('path');

const sa = JSON.parse(fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8'));

function createJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/devstorage.full_control',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const toSign = header + '.' + payload;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(toSign);
  const sig = sign.sign(sa.private_key, 'base64url');
  return toSign + '.' + sig;
}

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (d) => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function setCors() {
  // 1. Get access token
  const jwtToken = createJWT();
  const tokenBody = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + encodeURIComponent(jwtToken);

  const tokenResp = await makeRequest({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(tokenBody) },
  }, tokenBody);

  const tokenData = JSON.parse(tokenResp.body);
  if (!tokenData.access_token) {
    console.error('Failed to get token:', tokenResp.body);
    process.exit(1);
  }
  console.log('Got access token.');

  const accessToken = tokenData.access_token;
  const bucket = 'reviewhub-91cfb.firebasestorage.app';
  const corsConfig = JSON.stringify({
    cors: [{
      origin: ['*'],
      method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
      responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
      maxAgeSeconds: 3600,
    }],
  });

  const corsResp = await makeRequest({
    hostname: 'storage.googleapis.com',
    path: '/storage/v1/b/' + encodeURIComponent(bucket) + '?fields=cors',
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(corsConfig),
    },
  }, corsConfig);

  console.log('CORS update status:', corsResp.status);
  console.log('Response:', corsResp.body.substring(0, 300));

  if (corsResp.status === 200) {
    console.log('CORS configured successfully!');
  } else {
    console.error('Failed to set CORS.');
    process.exit(1);
  }
}

setCors().catch((e) => { console.error(e); process.exit(1); });
