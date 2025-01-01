// grpcClient1.js
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { accessTokenBloom, refreshTokenBloom } from '../api-server/utils/bloom-module.js';
import path from 'path';
import { fileURLToPath } from 'url';

// To get __dirname using ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the absolute path to the proto file
const PROTO_PATH = path.resolve(__dirname, './protos/bloom.proto');

// Load the proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const bloomProto = grpc.loadPackageDefinition(packageDefinition).bloom;

// Create the gRPC client
const client = new bloomProto.BloomService('localhost:50051', grpc.credentials.createInsecure());

/**
 * Ensures that subscriptions are initialized only once.
 */
let grpcClientInitialized = false;

/**
 * Initializes gRPC subscriptions.
 */
export function initGrpcClient() {
  if (grpcClientInitialized) return;

  const subscribe = (tokenType) => {
    const call = client.SubscribeUpdates({ tokenType });
    console.log(`Subscription initiated for ${tokenType} updates`);

    call.on('data', (update) => {
      console.log(`Received update: ${JSON.stringify(update)}`);
      const { action, claim, value } = update;
      const filterItem = `${claim}-${value}`;

      if (action === 'add') {
        if (tokenType === 'access') {
          accessTokenBloom.filterAdd(filterItem);
          console.log(`Access Token revoked: ${filterItem}`);
        } else if (tokenType === 'refresh') {
          refreshTokenBloom.filterAdd(filterItem);
          console.log(`Refresh Token revoked: ${filterItem}`);
        }
      }
      
      if (action === 'check') {
        let found;
        if (tokenType === 'access') {
          found = accessTokenBloom.filterHas(filterItem);
        } else if (tokenType === 'refresh') {
          found = refreshTokenBloom.filterHas(filterItem);
        }
        const responseMessage = found ? 'true' : 'false';
        console.log(`Sending response: ${responseMessage}`);
        sendResponse(tokenType, claim, value, responseMessage)
          .then((success) => {
            console.log(`Response sent successfully: ${success}`);
          })
          .catch((error) => {
            console.error('Error sending response:', error);
          });
      }
    });

    call.on('end', () => {
      console.log(`Subscription for ${tokenType} updates ended`);
      // Optional: Re-subscribe
      setTimeout(() => subscribe(tokenType), 1000);
    });

    call.on('error', (error) => {
      console.error(`Error in subscription for ${tokenType} updates:`, error);
      // Optional: Re-subscribe after a delay
      setTimeout(() => subscribe(tokenType), 5000);
    });
  };

  subscribe('access');
  subscribe('refresh');

  grpcClientInitialized = true;
}

const CLIENT_ID = process.env. CLIENT_ID; // Remplacez par un identifiant unique pour chaque instance

export const sendResponse = (tokenType, claim, value, responseMessage) => {
  return new Promise((resolve, reject) => {
    client.SendResponse({ 
      clientId: CLIENT_ID,              // Ajout de clientId
      tokenType, 
      claim, 
      value, 
      responseMessage 
    }, (error, response) => {
      if (error) {
        console.error('SendResponse Error:', error);
        return reject(error);
      }
      console.log(`SendResponse Acknowledged: ${response.message}`);
      resolve(response.success);
    });
  });
};
