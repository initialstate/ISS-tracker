'use strict';
let https = require('https'),
  http = require('http');

// Your bucket key
const ISBucketKey = 'isslambda', 
    issFeed = 'iss-now',
    issCrew = 'astros';

// Your access key
const ISAccessKey = 'Your_Access_Key';

// Lambda function initialization
exports.handler = (event, context, callback) => {
  // Fetch and stream the ISS position data
  getLocationData(issFeed, (error, data) =>
  {
    if (error) {
      context.fail();
    } else {
      let isRequestBody = [
        {
          "key": ":globe_with_meridians:Current Location",
          "value": combineCoord(data.iss_position.latitude,data.iss_position.longitude)
        }
      ];  
      sendToInitialState(ISAccessKey, isRequestBody, callback);
    }
  });
  // Fetch and stream the current number of people on the ISS
  getAstronautData(issCrew, (error, data) =>
  {
    if (error) {
      context.fail();
    } else {
      let isRequestBody = [
        {
          "key": ":alien:How many people are in space?",
          "value": data.number
        }
      ];
      
      sendToInitialState(ISAccessKey, isRequestBody, callback);
    }
  });
};

// Combine the latitude and longitude into coordinates
// Initial State can read
function combineCoord(lat,lon) {
  var combined = String(lat) + "," + String(lon);

  return combined;
}

// Fetch JSON data from the ISS location URL
function getLocationData(feed, callback) {
  const req = http.request({
    hostname: 'api.open-notify.org',
    port: '80',
    path: '/'+feed+'.json',
    method: 'GET'
  }, (res) => {
    let body = '';
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('Successfully finished processing HTTP response');
      body = JSON.parse(body);
      callback(null, body);
    });
  });
  req.on('error', callback);
  req.end();
}

// Fetch JSON data from the ISS people URL
function getAstronautData(feed, callback) {
  const req = http.request({
    hostname: 'api.open-notify.org',
    port: '80',
    path: '/'+feed+'.json',
    method: 'GET'
  }, (res) => {
    let body = '';
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('Successfully finished processing HTTP response');
      body = JSON.parse(body);
      callback(null, body);
    });
  });
  req.on('error', callback);
  req.end();
}

// Send data to Initial State
function sendToInitialState(accessKey, data, callback) {
  const req = https.request({
    hostname: 'groker.initialstate.com',
    port: '443',
    path: '/api/events',
    method: 'POST',
    headers: {
      'X-IS-AccessKey': accessKey,
      'X-IS-BucketKey': ISBucketKey,
      'Content-Type': 'application/json',
      'Accept-Version': '~0'
    }
  }, (res) => {
    let body = '';
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('Successfully processed HTTPS response');
      // If we know it's JSON, parse it
      if (res.headers['content-type'] === 'application/json') {
        body = JSON.parse(body);
      }
      callback(null, body);
    });
  });
  req.on('error', callback);
  req.end(JSON.stringify(data));
}
