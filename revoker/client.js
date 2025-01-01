// client for testing revoker

import jwt from "jsonwebtoken";

const adminToken = jwt.sign({
  admin: '987654321-1234567890',
  sub: '1234567890',
  fam: '1234567890',
  jti: '1234567890',
  },
  process.env.JWT_SECRET_KEY,
  { expiresIn: '1h' }
);


console.log(adminToken);

//
const response = await fetch('http://localhost:4000/revoke/access/jti/123-456-7890', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
});

const data = await response.json();
console.log(data);

// // check if the token is revoked
// const response2 = await fetch('http://localhost:4000/check/access/jti/123-456-7890', {
//   method: 'GET',
//   headers: {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${adminToken}`
//   },
// });

// const data2 = await response2.json();
// console.log(data2);

// check if the token is revoked
const response3 = await fetch('http://localhost:4000/check/access/jti/1234567890', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
});

const data3 = await response3.json();
console.log(data3);


const response4 = await fetch('http://localhost:4000/check/access/jti/123-456-7890', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  }
});

const data4 = await response4.json();
console.log(data4);






