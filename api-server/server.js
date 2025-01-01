import express from 'express';
import { auth } from './middlewares/auth.js';
import { accessTokenBloom, refreshTokenBloom } from './utils/bloom-module.js';
import { createBloomMiddleware } from './middlewares/bloom-filter.js';
import { initGrpcClient } from '../grpc/grpcClient.js';

const app = express();
const port = process.env.PORT || 3000;;

app.use(express.json());

// jti: revoke a device user session
// fam: revoke all device user sessions -> change family UUID claim when reconnecting
// sub: you are fired !!!
// admin: you are not an admin anymore

// Claims to check in the middleware for all types of tokens
const accessClaimsToCheck = ['jti', 'fam', 'sub', 'admin'];
const refreshClaimsToCheck = ['jti', 'sub', 'admin'];

// Create middlewares to check the claims for access and refresh tokens
const checkAccessRevoc = createBloomMiddleware(accessClaimsToCheck, accessTokenBloom);
const checkRefreshRevoc = createBloomMiddleware(refreshClaimsToCheck, refreshTokenBloom);

app.get('/protected', auth, checkAccessRevoc, (req, res) => {
  console.log('Protected route');
  res.status(200).json({ message: 'You are authorized!' });
});

app.get('/newtoken', auth, checkRefreshRevoc, (req, res) => {
  console.log('Refresh route');
  res.status(200).json({ message: 'You are authorized!' });
});

// Start the HTTP server
app.listen(port, () => {
  console.log(`API-server HTTP running on port ${port}`);
  
  // Initialize the gRPC client after starting the HTTP server
  initGrpcClient();
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  accessTokenBloom.stopRotation();
  refreshTokenBloom.stopRotation();
  process.exit();
});