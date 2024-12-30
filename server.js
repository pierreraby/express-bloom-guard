import express from 'express';
import jwt from 'jsonwebtoken';
import {auth} from './auth.js';
import {admin} from './auth.js';
import checkRevocation from './bloom-middleware.js';
import {add} from './bloom-module.js';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/newtoken', (req, res) => {
  const token =jwt.sign({
      "iss": "https://auth.itsme.com",
      "sub": "1234567890",
      "aud": "https://api.itsme.com",
      "name": "John Doe",
      "jti": "f8d7a4e3-1b6d-4f3b-9b3d-6f43f7b6f4e8",
      "fam": "e7b8a1d4-3f6b-4d3b-8b3d-7f43f7b6f4e3",
      "admin": false
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '1h'
    }
  );
  res.status(200).json({ token });
});

app.get('/newtokenadmin', (req, res) => {
  const token =jwt.sign({
      "iss": "https://auth.itsme.com",
      "sub": "1234567890",
      "aud": "https://api.itsme.com",
      "name": "Jane Doe",
      "jti": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      "fam": "q1r2s3t4-5u6v-7w8x-9y0z-1a2b3c4d5e6f",
      "admin": true
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '1h'
    }
  );
  res.status(200).json({ token });
});

app.get('/protected', auth, (req, res) => {
  res.status(200).json({ message: 'Protected route' });
});

app.get('/protected2', auth, checkRevocation, (req, res) => {
  res.status(200).json({ message: 'Protected route 2 with revocation enabled' });
});

app.post('/revoke', admin, checkRevocation, (req, res) => {
  try {
    const jti = req.body.jti;
    add(jti);
    res.status(200).json({ message: 'Token revoked' });
  } catch(error) {
    res.status(500).json({ message: `Error: ${ error }` });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});