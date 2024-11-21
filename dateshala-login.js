import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import creds from './creds.js';

// Base URL for the API
const BASE_URL = "https://dateshala.netsolutionindia.com/api/login";

export let options = {
  vus: 10, // Number of virtual users
  duration: "30s", // Test duration
};

export default function () {
  // Payload for the login request
  const payload = JSON.stringify({
    is_agreed: true,
    provider_id: "9090909090",
    provider_verification: "9999",
    country_code: "+91",
    provider_type: "phone",
    apn_token: "",
    user_type: "customer",
  });

   // Headers for the login request
   const headers = {
    "Content-Type": "application/json",
  };


  // Make the POST request
  const res = http.post(BASE_URL, payload, { headers });

  // Check the response
  check(res, {
    "is status 200": (r) => r.status === 200,
    "has token": (r) => r.json("data.token") !== undefined,
  });

  // Log the response for debugging
  if (res.status !== 200) {
    console.error(`Request failed with status ${res.status}`);
  } else {
    console.log(`Login successful: ${res.json("data.token") }`);
  }

  // Simulate user behavior by sleeping for a short duration
  sleep(1);
}
