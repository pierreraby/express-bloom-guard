import express from 'express';
import {auth, admin} from './middlewares/auth.js';
import checkRevocation from './middlewares/bloomfilter.js';
import {filterAdd} from './utils/bloom-module.js';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/revoke', admin, (req, res) => {
  try {
    const filterItem = "jti-" +req.body.jti;
    filterAdd(filterItem);
    res.status(200).json({ message: 'Token revoked' });
  } catch(error) {
    res.status(500).json({ message: `Error: ${ error }` });
  }
});

app.post('/check', admin, (req, res) => {
  try {
    const result = checkRevocation(req.body.jti);
    res.status(200).json({ message: result });
  } catch(error) {
    res.status(500).json({ message: `Error: ${ error }` });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});