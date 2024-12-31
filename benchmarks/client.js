import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

// for naive testing of revocation
// don't forget to start the server !

const NUM_ITEMS = 10000;

function getTokensData() {
  const tokensData = [];
  for (let i = 0; i < NUM_ITEMS; i++) {
    const jti = nanoid();
    const token = jwt.sign({
        "iss": "https://auth.itsme.com",
        "sub": "1234567890",
        "aud": "https://api.itsme.com",
        "name": "John Doe",
        "jti": jti,
        "fam": "e7b8a1d4-3f6b-4d3b-8b3d-7f43f7b6f4e3",
        "admin": "no"
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: '1h'
      }
    );
    tokensData.push({token, jti});
    if (i % 1000 === 0) {
      console.log(i);
    }
  }
  console.log('tokensData array length : ' +tokensData.length);
  return tokensData;
}

async function revokeTokens(tokensData, tokenadmin) {
  for (const tokenData of tokensData) {
    try {
      const res = await fetch('http://localhost:3000/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenadmin}`
        },
        body: JSON.stringify({ jti: tokenData.jti })
      });

      if (res.status !== 200) {
        throw new Error('error');
      }
    } catch (err) {
      console.log('revocation error : ' + err);
    }
  }
}

async function getProtected(tokensData) {
  let revoked = 0;
  let norevoked = 0;
  for (const tokenData of tokensData) {
    try {
      const res = await fetch('http://localhost:3000/protected2', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`
        }
      });

      if (res.status === 401) {
        revoked++;
        continue;
      }
      if (res.status !== 200) {
        throw new Error('error');
      }
      norevoked++;
    } catch (err) {
      console.log('getProtected error : ' + err);
    }
  }
  return { revoked, norevoked };
}

const tokenadmin = jwt.sign({
  "iss": "https://auth.itsme.com",
  "sub": "1234567890",
  "aud": "https://api.itsme.com",
  "name": "John Doe",
  "jti": nanoid(),
  "fam": "e7b8a1d4-3f6b-4d3b-8b3d-7f43f7b6f4e3",
  "admin": "yes"
  },
  process.env.JWT_SECRET_KEY,
  {
    expiresIn: '1h'
  }
);

console.log('Generate Tokens to be revoked');
const tokens_rev = getTokensData();
console.log('Start Revokation')
await revokeTokens(tokens_rev, tokenadmin)
console.log('Revokation Done')

console.log('Start "get protected" path with revoked tokens');
const {revoked, norevoked} = await getProtected(tokens_rev)
console.log('"get Protected" Done with revoked tokens')
console.log('Revoked : ' + revoked)
console.log('Not Revoked : ' + norevoked)

console.log('Generate Tokens to be not revoked');
const tokens_norev = getTokensData();

console.log('Start "get protected" path with non revoked tokens');
const {revoked: rev, norevoked: norev} = await getProtected(tokens_norev)
console.log('"get Protected Done with available tokens')
console.log('Revoked : ' + rev)
console.log('Not Revoked : ' + norev)

