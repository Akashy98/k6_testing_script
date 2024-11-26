import http from 'k6/http';
import { Counter, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import creds from './creds.js';
import { check } from 'k6';
import checkResponse from './helpers/check-response.js';



const submitResgister = new Counter('submitted_register_done');
const ProfileUpdate = new Counter('profile_update_done');
const homerCategoryList = new Counter('home_category_done');
const requestCreate = new Counter('request_create_done');
const addMoney = new Counter('add_wallet_money_done');
const requestDetail = new Counter('get_request_detail');
const acceptRequest = new Counter('accept_request_done');
const startRequest = new Counter('start_request_done');
const completeRequest = new Counter('complete_request_done');

// Define Trends to track response times for each API

const trendNames = [
  'submitted_register_duration',
  'profile_update_duration',
  'home_category_duration',
  'request_create_duration',
  'add_wallet_money_duration',
  'get_request_detail_duration',
  'accept_request_duration',
  'start_request_duration',
  'complete_request_duration'
];


const trends = {
  submitResgisterD: new Trend('submitted_register_duration'),
  ProfileUpdateD: new Trend('profile_update_duration'),
  homerCategoryListD: new Trend('home_category_duration'),
  requestCreateD: new Trend('request_create_duration'),
  addMoneyD: new Trend('add_wallet_money_duration'),
  requestDetailD: new Trend('get_request_detail_duration'),
  acceptRequestD: new Trend('accept_request_duration'),
  startRequestD: new Trend('start_request_duration'),
  completeRequestD: new Trend('complete_request_duration'),
};


const data = new SharedArray('data', function () {
    // here you can open files, and then do additional processing or generate the array with data dynamically
    const f = JSON.parse(open('./data.json'));
    return f; // f must be an array[]
  });

  export const options = {
    // Key configurations for Soak test in this section
    stages: [
      { duration: '1m', target: 1}, // traffic ramp-up from 1 to 100 users over 5 minutes.
      // { duration: '1h', target: 100 }, // stay at 100 users for 8 hours!!!
      // { duration: '5m', target: 0 }, // ramp-down to 0 users
    ],
  };
  
const [{ env}] = data;
  
const { BASE_URL } = creds(env);

function getExpert(findId) {
  const experts = {
    35: 9988776655,
    767: 8894077872,
    1077: 8888866666
  };

  if (experts[findId]) {
    return experts[findId];
  } else {
    throw new Error(`Expert with ID ${findId} not found.`);
  }
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPhoneNumberSuffix() {
    const minSuffix = 1000000000; // Minimum 10-digit number
    const maxSuffix = 9999999900; // Maximum 10-digiumber
    const suffix = Math.floor(Math.random() * (maxSuffix - minSuffix + 1)) + minSuffix;
    return String(suffix).slice(0, 10);
}

function generateFakeUser() {
  const genders = ['Male', 'Female', 'Non_Binary'];
  const randomGender = genders[Math.floor(Math.random() * genders.length)];

  return {
    email: "",
    invite_code: "",
    national_id: "",
    name: `User_${Math.floor(Math.random() * 1000)}`,
    country_code: '+91',
    bio: `This is a bio for user_${Math.floor(Math.random() * 1000)}`,
    apn_token: Math.random().toString(36).substring(2, 66).toUpperCase(),
    first_name: `FirstName${Math.floor(Math.random() * 1000)}`,
    last_name: `LastName${Math.floor(Math.random() * 1000)}`,
    gender: randomGender,
    master_preferences: JSON.stringify([]),
    dob: generateRandomDOB(),
  };
}

function generateRandomDOB() {
  const minAge = 18;
  const maxAge = 65;
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - Math.floor(Math.random() * (maxAge - minAge + 1) + minAge);
  const birthMonth = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
  const birthDay = Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0');
  return `${birthYear}-${birthMonth}-${birthDay}`;
}

function register(phoneNumber, userType) {
  const loginPayload = {
    is_agreed: true,
    provider_id: phoneNumber,
    provider_verification: "9999",
    country_code: "+91",
    provider_type: "phone",
    apn_token: "",
    user_type: userType,
  };

  const headers = {
    "Content-Type": "application/json",
  };

  const submitResgisterResponse = http.post(`${BASE_URL}/login`, JSON.stringify(loginPayload),{ headers });

  if (submitResgisterResponse.status!== 200) {
    throw new Error(submitResgisterResponse.error);
  } else {
    // Track HTTP request durations
    trends.submitResgisterD.add(submitResgisterResponse.timings.duration);
    console.log('Success for registration for phone number ' + phoneNumber);
  }
  const { data: { token} } = JSON.parse(submitResgisterResponse.body);
  submitResgister.add(1);
  return token;
}

function updateProfile(requestParams, phoneNumber) {
  const payload = {
    ...generateFakeUser(),
    phone: phoneNumber,
  };  

  const submitResponse = http.post(`${BASE_URL}/profile-update`, JSON.stringify(payload), requestParams);

  if (submitResponse.status!== 200) {
    throw new Error(submitResponse.error);
  } else {
    // Track HTTP request durations
    trends.ProfileUpdateD.add(submitResponse.timings.duration);
    console.log('Success for update profile for phone number ' + phoneNumber);    
  }
  ProfileUpdate.add(1);
}

function categories(requestParams, phoneNumber) {  

  const categoriesResult = http.get(`${BASE_URL}/v1/categories?page_no=1`, requestParams);

  if (categoriesResult.status!== 200) {
    throw new Error(categoriesResult.error);
  } else {
    // Track HTTP request durations
    trends.homerCategoryListD.add(categoriesResult.timings.duration);
    console.log('Success for categories for phone number ' + phoneNumber);    
  }
  homerCategoryList.add(1);
  
  return JSON.parse(categoriesResult.body).data;
}

function getRequestDetail(requestParams, phoneNumber, requestId) {  

  const requestDetailData = http.get(`${BASE_URL}/request-detail?request_id=${requestId}`, requestParams);

  if (requestDetailData.status!== 200) {
    throw new Error(requestDetailData.error);
  } else {
    // Track HTTP request durations
    trends.requestDetailD.add(requestDetailData.timings.duration);
    console.log('Success for categories for phone number ' + phoneNumber);    
  }
  requestDetail.add(1);
  
  return JSON.parse(requestDetailData.body).data;
}

function createExpertRequest(requestParams, phoneNumber, requestCreateObj)
{
  const submitResponse = http.post(`${BASE_URL}/create-request`, JSON.stringify(requestCreateObj), requestParams);
  
  if (submitResponse.status!== 200) {
    throw new Error(submitResponse.error);
  } else {
    // Track HTTP request durations
    trends.requestCreateD.add(submitResponse.timings.duration);
    console.log('Success for request create for phone number ' + phoneNumber);    
  }
  requestCreate.add(1);

  return JSON.parse(submitResponse.body).data;
}

function addWalletMoney(requestParams, phoneNumber, addWalletObj)
{
  const submitResponse = http.post(`${BASE_URL}/add-wallet-money`, JSON.stringify(addWalletObj), requestParams);
  
  if (submitResponse.status!== 200) {
    throw new Error(submitResponse.error);
  } else {
    // Track HTTP request durations
    trends.addMoneyD.add(submitResponse.timings.duration);
    console.log('Success for wallet moeny added for phone number ' + phoneNumber);    
  }
  addMoney.add(1);
}

function submitAcceptRequest(requestParams, phoneNumber, postParamObj)
{
  const submitResponse = http.post(`${BASE_URL}/accept-request`, JSON.stringify(postParamObj), requestParams);
  
  if (submitResponse.status!== 200) {
    throw new Error(submitResponse.error);
  } else {
    // Track HTTP request durations
    trends.acceptRequestD.add(submitResponse.timings.duration);
    console.log('Success for acceept request for phone number ' + phoneNumber);    
  }
  acceptRequest.add(1);
}

function submitStartRequest(requestParams, phoneNumber, postParamObj)
{
  const submitResponse = http.post(`${BASE_URL}/start-request`, JSON.stringify(postParamObj), requestParams);
  
  if (submitResponse.status!== 200) {
    throw new Error(submitResponse.error);
  } else {
    // Track HTTP request durations
    trends.startRequestD.add(submitResponse.timings.duration);
    console.log('Success for acceept request for phone number ' + phoneNumber);    
  }
  startRequest.add(1);
}

function submitCompletedRequest(requestParams, phoneNumber, completedParamObj)
{
  const submitResponse = http.post(`${BASE_URL}/call-status`, JSON.stringify(completedParamObj), requestParams);
  
  if (submitResponse.status!== 200) {
    throw new Error(submitResponse.error);
  } else {
    // Track HTTP request durations
    trends.completeRequestD.add(submitResponse.timings.duration);
    console.log('Success for complete request for phone number ' + phoneNumber);    
  }
  completeRequest.add(1);
}


export default function () {

  const phoneNumberSuffix = getRandomPhoneNumberSuffix().toString();

  const phoneNumber = '+91' + phoneNumberSuffix;

  console.log('Registering phone number'+ phoneNumber);

  const token = register(phoneNumberSuffix, "customer");
  // const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI1NyIsImp0aSI6IjZiZDYxZjdkMTFmN2VlZWJhNzJiNjk3Y2Q1MzIzYTM4YTk1YTY3YzY1MWZiNzM5NzFmMjdhN2Y5NTYyYjQyMzNjOWFlZjRlYzhlN2MyZDhlIiwiaWF0IjoxNzMyMjY2NDgxLCJuYmYiOjE3MzIyNjY0ODEsImV4cCI6MTc0NzkwNDg4MSwic3ViIjoiMTI0MSIsInNjb3BlcyI6W119.bCaOrBbjE4mgcfdj71LcQWrxrtvL5DzXUrgDUCvR-BZFyv47gurIf0V7pFCEoazvJUZUjUS6yLLut6oTjJzRSHniHA84vApfP4OHyv1c_rqHTphGMWw9Q5IyWSVhOJ4eVC_7vjHuAP5nAt8LqsD8_Rk0RNCmT1HGZaN5M-UupIyqb70ut81RDYW3ZGGzLsp37mBpn7PQvMxqaJncEFm6X6rARZZybcKveG9MSD2ahrBPgO2Gg8OB5peFhiv68A1MJZdRKhZCXazkMr4vzWHNuVR32OIFPd7sFPU0LOsvTms33FmCLZrDztZjo-qUQJRQ6BYXj-b09uCkSyVF7PeXIPaw_EXo_B5x7GEP3IqHpNWg4qxQDZcMwG7HZGbRIxp5_KlP2EmhTeKGAUTS3lwExmEougaOk8R-BXcXcnWf0UnE5MPpm5BhMjaqBFDvrQck0dKJriTb-aq25k8iRl7JSCvokMesqfTe1brwzNX6l5J3PFqIb8q0yVIzVkNHhOPnrpGAkp4zE0HwyM3vWLUU5Oeeq8F7Ws1RaOooI62h7nbygD5D0GjE4oxu6AfbAFzkDg_YfOyDVu-6JQD0eDDp0CcISqnoquQ_-hwbURa5vnJwBSt9A2yZNVvQmUvK16nHApDqD8s5IhPTpEKKn_hqj0qyVWj4ma2mwRGB6nJkdUg";
  
  const requestParams = {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'user-type': 'customer'
    }
  };

  updateProfile(requestParams, phoneNumberSuffix);

  const categoryApiData = categories(requestParams, phoneNumber);

  const consultants =  categoryApiData.all_doctors;

  // Selecting a random consultant from the array
  let randomIndex = Math.floor(Math.random() * consultants.length);
  let randomConsultant = consultants[randomIndex];

  const requestCreateObj = {
    "consultant_id": randomConsultant.id,
    "service_id": 2,
    "time":"",
    "date":"",
    "total_charges":0,
    "slot_duration":0,
    "schedule_type":"instant",
    "category_id":randomConsultant.category_id
  };

  const randomValue = getRandomInteger(100, 200);

  const addWalletObj = {
    "amount": randomValue
  };

  addWalletMoney(requestParams, phoneNumber, addWalletObj);
  
  const requestData = createExpertRequest(requestParams, phoneNumber, requestCreateObj);

  const requestId =  requestData.request.id;

  const requestDetailData = getRequestDetail(requestParams, phoneNumber, requestId);

  const request_original_user_id =  requestDetailData.request_detail.original_user_id;

  const expertPhoneNumber = getExpert(request_original_user_id);

  // Login with expert

  const expertToken = register(expertPhoneNumber, "service_provider")

  const expertRequestParams = {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${expertToken}`,
        'user-type': 'service_provider'
    }
  };

  const postParamObj = {
    "request_id": requestId
  };

  submitAcceptRequest(expertRequestParams, phoneNumber, postParamObj);
  
  submitStartRequest(expertRequestParams, phoneNumber, postParamObj);

  const completedParamObj = {
    "request_id": requestId,
    "status":"completed"
  };
  
  submitCompletedRequest(expertRequestParams, phoneNumber, completedParamObj);

}

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
