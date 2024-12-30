import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const NUM_ITEMS = 10000;
const tokens = [];

for (let i = 0; i < NUM_ITEMS; i++) {
  const jti = nanoid();
  const token = jwt.sign({
      "iss": "https://auth.itsme.com",
      "sub": "1234567890",
      "aud": "https://api.itsme.com",
      "name": "John Doe",
      "jti": jti,
      "fam": "e7b8a1d4-3f6b-4d3b-8b3d-7f43f7b6f4e3",
      "admin": false
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '1h'
    }
  );
  tokens.push({token, jti});
  if (i % 1000 === 0) {
    console.log(i);
  }
}

const tokenadmin = jwt.sign({
  "iss": "https://auth.itsme.com",
  "sub": "1234567890",
  "aud": "https://api.itsme.com",
  "name": "John Doe",
  "jti": nanoid(),
  "fam": "e7b8a1d4-3f6b-4d3b-8b3d-7f43f7b6f4e3",
  "admin": true
},
process.env.JWT_SECRET_KEY,
{
  expiresIn: '1h'
}
);

console.log('token length : ' +tokens.length);

async function revokeTokens(tokens, tokenadmin) {
  for (const [index, item] of tokens.entries()) {
    try {
      const res = await fetch('http://localhost:3000/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenadmin}`
        },
        body: JSON.stringify({ jti: item.jti })
      });

      if (res.status !== 200) {
        throw new Error('error');
      }

      if (index % 1000 === 0) {
        console.log('revoke index : ' + index);
      }
    } catch (err) {
      console.log('error : ' + err);
    }
  }
}

await revokeTokens(tokens, tokenadmin)
console.log('Revokation Done')

let countrevoked = 0;
async function getProtected(tokens) {
  for (const [index, item] of tokens.entries()) {
    try {
      const res = await fetch('http://localhost:3000/protected2', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${item.token}`
        }
      });

      if (res.status !== 200) {
        throw new Error('error');
      }

      if (index % 1000 === 0) {
        console.log('protected index' + index);
      }
    } catch (err) {
      countrevoked++;
    }
  }
}

await getProtected(tokens)
console.log('Done')
console.log('countrevoked : ' + countrevoked);


const newtokens = [];
for (let i = 0; i < NUM_ITEMS; i++) {
  const jti = nanoid();
  const token = jwt.sign({
      "iss": "https://auth.itsme.com",
      "sub": "1234567890",
      "aud": "https://api.itsme.com",
      "name": "John Doe",
      "jti": jti,
      "fam": "e7b8a1d4-3f6b-4d3b-8b3d-7f43f7b6f4e3",
      "admin": false
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '1h'
    }
  );
  newtokens.push({token, jti});
  if (i % 1000 === 0) {
    console.log(i);
  }
}
console.log('newtoken length : ' +newtokens.length);

countrevoked = 0;
await getProtected(newtokens)
console.log('Done')
console.log('countrevoked ' + countrevoked);
