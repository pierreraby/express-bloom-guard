// bloom-server/grpcServer.js
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { accessTokenBloom, refreshTokenBloom } from '../revoker/utils/bloom-module.js';
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

// notifySubscribers.js
const subscribers = {
  access: [],
  refresh: []
};

const notifySubscribers = (tokenType, call) => {
  subscribers[tokenType].push(call);
};

const removeSubscriber = (tokenType, call) => {
  const index = subscribers[tokenType].indexOf(call);
  if (index !== -1) {
    subscribers[tokenType].splice(index, 1);
  }
};

const notifyAllSubscribers = (tokenType, update) => {
  if (subscribers[tokenType]) {
    subscribers[tokenType].forEach(call => call.write(update));
  }
};

const subscribeUpdates = (call) => {
  const { tokenType } = call.request;
  if (!['access', 'refresh'].includes(tokenType)) {
    call.write({ action: 'error', claim: '', value: 'Invalid tokenType' });
    call.end();
    return;
  }
  notifySubscribers(tokenType, call);
  console.log(`Client subscribed for ${tokenType} updates`);

  call.on('cancelled', () => {
    removeSubscriber(tokenType, call);
    console.log(`Client unsubscribed from ${tokenType} updates`);
  });
};

export const revokeToken = (tokenType, claim, value) => {
  console.log(`Revoking tokenType: ${tokenType}, claim: ${claim}, value: ${value}`);
  const filterItem = `${claim}-${value}`;
  if (tokenType === 'access') {
    accessTokenBloom.filterAdd(filterItem);
  } else if (tokenType === 'refresh') {
    refreshTokenBloom.filterAdd(filterItem);
  }
  notifyAllSubscribers(tokenType, { action: 'add', claim, value });
};

const pendingChecks = new Map();

/**
 * Initiates a token check and returns a promise that resolves with the aggregated result.
 */
export const checkToken = (tokenType, claim, value) => {
  notifyAllSubscribers(tokenType, { action: 'check', tokenType, claim, value });

  const key = `${tokenType}-${claim}-${value}`;
  const expectedResponses = subscribers[tokenType].length;

  return new Promise((resolve, reject) => {
    if (expectedResponses === 0) {
      // No subscribers for this tokenType
      return reject(new Error('No subscribers available for this tokenType'));
    }

    pendingChecks.set(key, {
      expectedResponses,
      receivedResponses: 0,
      hits: [],
      misses: [],
      resolve,
      reject,
    });

    // Timeout to reject the promise if responses are not received
    setTimeout(() => {
      if (pendingChecks.has(key)) {
        const check = pendingChecks.get(key);
        pendingChecks.delete(key);
        check.reject(new Error('Timeout waiting for responses'));
      }
    }, 5000); // 5 seconds timeout
  });
};

/**
 * Handles responses from the client and resolves the corresponding promises when all responses are received.
 */
const handleCheckResponse = (tokenType, claim, value, clientId, responseMessage) => {
  const key = `${tokenType}-${claim}-${value}`;
  const filterItem = `${claim}-${value}`;
  const check = pendingChecks.get(key);

  if (check) {
    check.receivedResponses += 1;
    if (responseMessage.toLowerCase() === 'true') {
      check.hits.push(clientId);
    } else {
      check.misses.push(clientId);
    }

    if (check.receivedResponses === check.expectedResponses) {
      // All responses have been received
      let inRevoker;
      if (tokenType === 'access') {
        inRevoker = accessTokenBloom.filterHas(filterItem);
      } else if (tokenType === 'refresh') {
        inRevoker = refreshTokenBloom.filterHas(filterItem);
      }
      inRevoker ? check.hits.push('revoker') : check.misses.push('revoker');
      // Resolve the promise with the aggregated hits and misses
      check.resolve({ hits: check.hits, misses: check.misses });
      pendingChecks.delete(key);
    }
  } else {
    console.warn(`No pending check found for key: ${key}`);
  }
};

const sendResponseHandler = (call, callback) => {
  const { tokenType, claim, value, responseMessage, clientId } = call.request;
  console.log(`Received response from client: tokenType=${tokenType}, claim=${claim}, value=${value}, message=${responseMessage}, clientId=${clientId}`);

  try {
    // Resolve the promise corresponding to the token check
    handleCheckResponse(tokenType, claim, value, clientId, responseMessage);
    console.log('handleCheckResponse executed successfully');

    // Call the callback to send the response to the client
    callback(null, { success: true, message: 'Response received successfully' });
    console.log('sendResponseHandler: Callback executed successfully');
  } catch (error) {
    console.error('sendResponseHandler Error:', error);
    callback(error, null); // Send the error to the client if an exception occurs
  }
};

// gRPC service
const BloomService = {
  SubscribeUpdates: subscribeUpdates,
  SendResponse: sendResponseHandler, // Adding the new method
};

// Starting the gRPC server
export const grpcServer = new grpc.Server();
grpcServer.addService(bloomProto.BloomService.service, BloomService);
grpcServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Error binding gRPC server:', err);
    return;
  }
  console.log(`gRPC server running on port ${port}`);
});