import http from "k6/http";
import { Counter, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import creds from './creds.js';
import homeApis from "./home-api.js";

const submitLogin = new Counter('submitted_login_done');
const getCategoryData = new Counter('get_category_data');
const getWallet = new Counter('get_wallet');
const getExpertDetail = new Counter('get_expert_detail');
const getExpertAvailability = new Counter('get_expert_availability');
const getWalletTransaction = new Counter('get_wallet_transaction');
const getChatListing = new Counter('get_chat_listing');
const getUpcomingRequest = new Counter('get_upcoming_request');
const getPreviousRequest = new Counter('get_previous_request');

// Define Trends to track response times for each API

const trendNames = [
  'submit_login_duration',
  'get_category_data_duration',
  'get_wallet_duration',
  'get_expert_detail_duration',
  'get_expert_availability_duration',
  'get_wallet_transaction_duration',
  'get_chat_listing_duration',
  'get_upcoming_request_duration',
  'get_previous_request_duration',
];

const trends = {
  submitLoginD: new Trend('submit_login_duration'),
  getCategoryDataD: new Trend('get_category_data_duration'),
  getWalletD: new Trend('get_wallet_duration'),
  getExpertDetailD: new Trend('get_expert_detail_duration'),
  getExpertAvailabilityD: new Trend('get_expert_availability_duration'),
  getWalletTransactionD: new Trend('get_wallet_transaction_duration'),
  getChatListingD: new Trend('get_chat_listing_duration'),
  getUpcomingRequestD: new Trend('get_upcoming_request_duration'),
  getPreviousRequestD: new Trend('get_previous_request_duration'),
};


const data = new SharedArray('data', function () {
    // here you can open files, and then do additional processing or generate the array with data dynamically
    const f = JSON.parse(open('./data.json'));
    return f; // f must be an array[]
  });

  export const options = {
    // Key configurations for Soak test in this section
    stages: [
      { duration: '1m', target: 2}, // traffic ramp-up from 1 to 100 users over 5 minutes.
      // { duration: '1h', target: 100 }, // stay at 100 users for 8 hours!!!
      // { duration: '5m', target: 0 }, // ramp-down to 0 users
    ],
  };
  
const [{ env}] = data;
  
const { BASE_URL } = creds(env);

const LOGIN_NUMBER = "9090909090";

function getRandomPhoneNumberSuffix() {
    const minSuffix = 1000000000; // Minimum 8-digit number
    const maxSuffix = 9999999900; // Maximum 8-digiumber
    const suffix = Math.floor(Math.random() * (maxSuffix - minSuffix + 1)) + minSuffix;
    return String(suffix).slice(0, 10);
}

export default function () {

    const token = getToken();

    const requestParams = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'user-type': 'customer'
        }
    };
    const phoneNumberSuffix = getRandomPhoneNumberSuffix().toString();
    const phoneNumber = '+91' + phoneNumberSuffix;
    const categoryId = 8;
    const serviceType = 'call';
    const ExpertId = 812;
    
    console.log('Registering phone number'+ phoneNumber);

    getCategoriesData(requestParams, phoneNumber, categoryId, serviceType);

    getWallets(requestParams, phoneNumber);

    getExpertDetails(requestParams, phoneNumber, ExpertId);

    getExpertAvailabilityData(requestParams, phoneNumber, categoryId, ExpertId);

    getWalletTransactionData(requestParams, phoneNumber);

    getChatListingData(requestParams, phoneNumber);

    getUpcomingRequestData(requestParams, phoneNumber);

    getPreviousRequestData(requestParams, phoneNumber);

}

function getToken()
{
  const loginPayload = {
    is_agreed: true,
    provider_id: "9090909090",
    provider_verification: "9999",
    country_code: "+91",
    provider_type: "phone",
    apn_token: "",
    user_type: "customer",
  };

  const headers = {
    "Content-Type": "application/json",
  };

  const submitLoginResponse = http.post(`${BASE_URL}/login`, JSON.stringify(loginPayload),{ headers });

  if (submitLoginResponse.status!== 200) {
    throw new Error(submitLoginResponse.error);
  } else {
    // Track HTTP request durations
    trends.submitLoginD.add(submitLoginResponse.timings.duration);
    console.log('Success for registration for phone number ' + LOGIN_NUMBER);
  }
  const { data: { token} } = JSON.parse(submitLoginResponse.body);
  submitLogin.add(1);
  return token;
}

function getCategoriesData(requestParams,phoneNumber, categoryId, serviceType) {
   
  const getCategoryDatas = http.get(`${BASE_URL}/v1/category-data?category_id=${categoryId}&page=1&service_type=${serviceType}`, requestParams);

  console.log('getCategoryDatas', getCategoryDatas.status);

  if (getCategoryDatas.status!== 200) {
      console.log('Error for getting category data ', getCategoryDatas);
    throw new Error(getCategoryDatas.error);
  } else {
    trends.getCategoryDataD.add(getCategoryDatas.timings.duration);
    console.log('Success for getting category data ' + phoneNumber + 'duration ' + getCategoryDatas.timings.duration);
    getCategoryData.add(1);
    return JSON.parse(getCategoryDatas.body).data.rows;
  }
}

function getWallets(requestParams, phoneNumber) {
   
  const getAllWallets = http.get(`${BASE_URL}/wallet`, requestParams);

  console.log('getWallets', getAllWallets.status);

  if (getAllWallets.status!== 200) {
      console.log('Error for getting Wallets', getAllWallets);
    throw new Error(getAllWallets.error);
  } else {
    trends.getWalletD.add(getAllWallets.timings.duration);
    console.log('Success for getting Wallets' + phoneNumber + 'duration ' + getAllWallets.timings.duration);
    getWallet.add(1);
    return getAllWallets; 
  }
}



function getExpertDetails(requestParams, phoneNumber, ExpertId) {
   
    const expertD = http.get(`${BASE_URL}/doctor-detail?doctor_id=${ExpertId}`, requestParams);

    console.log('getExpertDetails', expertD.status);

    if (expertD.status!== 200) {
        console.log('Error for expert detail', expertD);
      throw new Error(expertD.error);
    } else {
      trends.getExpertDetailD.add(expertD.timings.duration);
      console.log('Success for expert detail' + phoneNumber  + 'duration ' + expertD.timings.duration);
      getExpertDetail.add(1);
      return expertD; 
    }
  }

  function getExpertAvailabilityData(requestParams, phoneNumber, categoryId, ExpertId) {
   
    const expertAvailabilities = http.get(`${BASE_URL}/check-doctor-availability?category_id=${categoryId}&doctor_id=${ExpertId}`, requestParams);

    console.log('expertAvailabilities', expertAvailabilities.status);

    if (expertAvailabilities.status!== 200) {
        console.log('Error for expert availability', expertAvailabilities);
      throw new Error(expertAvailabilities.error);
    } else {
      trends.getExpertAvailabilityD.add(expertAvailabilities.timings.duration);
      console.log('Success for expert availability' + phoneNumber  + 'duration ' + expertAvailabilities.timings.duration);
      getExpertAvailability.add(1);
      return expertAvailabilities; 
    }
  }


  function getWalletTransactionData(requestParams, phoneNumber) {
   
    const transactions = http.get(`${BASE_URL}/wallet-history?transaction_type=all`, requestParams);

    console.log('transactions', transactions.status);

    if (transactions.status!== 200) {
        console.log('Error for creating loan listing', transactions);
      throw new Error(transactions.error);
    } else {
      trends.getWalletTransactionD.add(transactions.timings.duration);
      console.log('Success for fetching transactions' + phoneNumber);
      getWalletTransaction.add(1);
      return transactions; 
    }
  }

  function getChatListingData(requestParams, phoneNumber) {
   
    const chatlisting = http.get(`${BASE_URL}/chat-listing`, requestParams);

    console.log('chat listing', chatlisting.status);

    if (chatlisting.status!== 200) {
        console.log('Error for creating loan listing', chatlisting);
      throw new Error(chatlisting.error);
    } else {
      trends.getChatListingD.add(chatlisting.timings.duration);
      console.log('Success for fetching chat listing' + phoneNumber);
      getChatListing.add(1);
      return chatlisting; 
    }
  }

  function getUpcomingRequestData(requestParams, phoneNumber) {
   
    const upcommingReq = http.get(`${BASE_URL}/request-history?transaction_type=upcomming`, requestParams);

    console.log('Upcoming Requests', upcommingReq.status);

    if (upcommingReq.status!== 200) {
        console.log('Error for Upcoming Requests', upcommingReq);
      throw new Error(upcommingReq.error);
    } else {
      trends.getUpcomingRequestD.add(upcommingReq.timings.duration);
      console.log('Success for Upcoming Requests' + phoneNumber);
      getUpcomingRequest.add(1);
      return upcommingReq; 
    }
  }

  function getPreviousRequestData(requestParams, phoneNumber) {
   
    const previousReq = http.get(`${BASE_URL}/request-history?transaction_type=upcomming`, requestParams);

    console.log('Upcoming Requests', previousReq.status);

    if (previousReq.status!== 200) {
        console.log('Error for Upcoming Requests', previousReq);
      throw new Error(previousReq.error);
    } else {
      trends.getPreviousRequestD.add(previousReq.timings.duration);
      console.log('Success for Upcoming Requests' + phoneNumber);
      getPreviousRequest.add(1);
      return previousReq; 
    }
  }

// Summary function
export function handleSummary(data) {
  
  trendNames.forEach((trendName) => {
    if (data.metrics[trendName]) {
      console.log(
        `Average ${trendName} ======================> ${data.metrics[trendName].values.avg.toFixed(2)} ms`
      );
    } else {
      console.warn(`Metric ${trendName} not found in summary data.`);
    }
  });
}