import http from "k6/http";
import { Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import creds from './creds.js';
import homeApis from "./home-api.js";


const submitOtp = new Counter('submitted_otp_done');
const homeApiDone = new Counter('homeApi_done');
const myApplicationDone = new Counter('my_application_done');


const data = new SharedArray('data', function () {
    // here you can open files, and then do additional processing or generate the array with data dynamically
    const f = JSON.parse(open('./data.json'));
    return f; // f must be an array[]
  });
  
const [{ env}] = data;
  
const { BASE_URL } = creds(env);

function getRandomPhoneNumberSuffix() {
    const minSuffix = 10000000; // Minimum 8-digit number
    const maxSuffix = 99999999; // Maximum 8-digit number
    const suffix = Math.floor(Math.random() * (maxSuffix - minSuffix + 1)) + minSuffix;
    return String(suffix).slice(0, 7);
}
function register(phoneNumber) {
    const submitOtpObj = {
      'mobilenumber': phoneNumber,
      'otp': 1234567,
      'isSkip': true,
    };

    // api to submit otp
    const submitOtpResponse = http.post(`${BASE_URL}/auth/verify-otp`, JSON.stringify(submitOtpObj), {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  
    if (submitOtpResponse.status!== 201) {
      throw new Error(submitOtpResponse.error);
    } else {
      console.log('Success for registration for phone number ' + phoneNumber);
    }
    const { data: { token} } = JSON.parse(submitOtpResponse.body);
    submitOtp.add(1);
    return token;
  }

export default function () {
    const phoneNumberSuffix = getRandomPhoneNumberSuffix().toString();
    const phoneNumber = '051' + phoneNumberSuffix;

    console.log('Registering phone number'+ phoneNumber);

    const token = register(phoneNumber);

    console.log('Submitting token'+ token);

    const requestParams = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }};

    homeApis(BASE_URL, requestParams, phoneNumber, myApplicationDone, homeApiDone)


}