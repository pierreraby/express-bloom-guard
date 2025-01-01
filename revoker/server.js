// revoker server.js
import express from 'express';
import { revokeToken, checkToken} from '../grpc/grpcServer.js';
import { grpcServer } from '../grpc/grpcServer.js';
import { validateRevoke, validateCheck, validateAddClaim } from './middlewares/validators.js';
import { accessTokenBloom, refreshTokenBloom } from './utils/bloom-module.js';
import { admin } from './middlewares/auth.js';


const app = express();
const port = process.env.PORT || 3000; // Changez le port pour éviter le conflit

app.use(express.json());

app.post('/revoke/:tokenType/:claim/:value', admin, validateRevoke, async (req, res) => {
  const { tokenType, claim, value } = req.params;
  if (!['access', 'refresh'].includes(tokenType)) {
    return res.status(400).json({ message: 'Invalid tokenType' });
  }

  try {
    await revokeToken(tokenType, claim, value); // Utilisez await si revokeToken est asynchrone
    res.status(200).json({ message: `${tokenType} token revoked` });
  } catch (error) {
    res.status(500).json({ message: `Error : ${error.message}` });
  }
});

app.get('/check/:tokenType/:claim/:value', admin, validateCheck, async (req, res) => {
  const { tokenType, claim, value } = req.params;
  try {
    const result = await checkToken(tokenType, claim, value);
    res.status(200).json(result); // Renvoie {"hits": [...], "misses": [...]}
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

app.post('/addClaim/:tokenType/:claim', admin, validateAddClaim, (req, res) => {
  // Add a claim to the list of claims to check in the middleware bloome-filter.js
  const { claim } = req.params;



});

app.get('/:tokenType/getClaims', admin, (req, res) => {
  
});

app.get('/instances', admin, (req, res) => {
  
});

app.post('/addInstance/', admin, (req, res) => {
  
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Gestionnaire d'arrêt pour nettoyer les rotations
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  accessTokenBloom.stopRotation();
  refreshTokenBloom.stopRotation();
  grpcServer.tryShutdown(() => {
    process.exit();
  });
});