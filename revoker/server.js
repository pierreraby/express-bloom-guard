import express from 'express';
import {auth, admin} from './auth.js';
import checkRevocation from './bloom.js';
import {filterAdd} from './bloom-module.js';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/protected', auth, (req, res) => {
  res.status(200).json({ message: 'Protected route' });
});

app.get('/protected2', auth, checkRevocation, (req, res) => {
  res.status(200).json({ message: 'Protected route 2 with revocation enabled' });
});

app.post('/revoke', admin, checkRevocation, (req, res) => {
  try {
    const filterItem = "jti-" +req.body.jti;
    filterAdd(filterItem);
    res.status(200).json({ message: 'Token revoked' });
  } catch(error) {
    res.status(500).json({ message: `Error: ${ error }` });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});