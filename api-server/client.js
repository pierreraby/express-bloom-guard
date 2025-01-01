// client for testing revoker

import jwt from "jsonwebtoken";

let token = jwt.sign({
  "admin": 'no',
  "sub": '1234567890',
  "fam": '1234567890',
  "jti": '123-456-7890'
  },
  process.env.JWT_SECRET_KEY,
  { expiresIn: '1h' }
);

console.log(token);

const response = await fetch('http://localhost:4001/protected', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
});

const data = await response.json();
console.log('protected 1 :' + data.message);

const response2 = await fetch('http://localhost:4002/protected', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
});

const data2 = await response2.json();
console.log('protected 2: ' + data2.message);

const response3 = await fetch('http://localhost:4001/newtoken', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
});

const data3 = await response3.json();
console.log('refresh 1: ' +data3.message);

const response4 = await fetch('http://localhost:4002/newtoken', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
});

const data4 = await response4.json();
console.log('refresh 1: ' +data4.message);



