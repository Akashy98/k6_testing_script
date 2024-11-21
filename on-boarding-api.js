import http from "k6/http";
import { Counter, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import creds from './creds.js';
import homeApis from "./home-api.js";


const submitOtp = new Counter('submitted_otp_done');
const updateTestUserDone = new Counter('update_test_user_done');
const updatePanDone = new Counter('pan_done');
const updateAadharDone = new Counter('aadhar_done');
const updateCreditLimitDone = new Counter('credit_limit_done');
const gettingAllHospital = new Counter('get_all_hospital');
const updateHospitalBillDone = new Counter('update_hospital_bill');
const payInterestDone = new Counter('pay_interest_done');
const termListDone = new Counter('term_list_done');
const updateBillDone = new Counter('update_bill_done');
const loanSummaryDone = new Counter('loan_summary_done');
const loanListingDone = new Counter('loan_listing_done');
const loanDetailDone = new Counter('loan_detail_done');

// Define Trends to track response times for each API
const trends = {
  submitOtp: new Trend('submit_otp_duration'),
  updateFakeUser: new Trend('update_fake_user_duration'),
  updatePan: new Trend('update_pan_duration'),
  updateAadhar: new Trend('update_aadhar_duration'),
  updateCreditLimit: new Trend('update_credit_limit_duration'),
  getAllHospital: new Trend('get_all_hospital_duration'),
  updateHospitalBill: new Trend('update_hospital_bill_duration'),
  payInterest: new Trend('pay_interest_duration'),
  termList: new Trend('term_list_duration'),
  updateBill: new Trend('update_bill_duration'),
  loanSummary: new Trend('loan_summary_duration'),
  loanListing: new Trend('loan_listing_duration'),
  loanDetail: new Trend('loan_detail_duration')
};




const data = new SharedArray('data', function () {
    // here you can open files, and then do additional processing or generate the array with data dynamically
    const f = JSON.parse(open('./data.json'));
    return f; // f must be an array[]
  });

  export const options = {
    // Key configurations for Soak test in this section
    stages: [
      { duration: '5m', target: 100 }, // traffic ramp-up from 1 to 100 users over 5 minutes.
      { duration: '1h', target: 100 }, // stay at 100 users for 8 hours!!!
      { duration: '5m', target: 0 }, // ramp-down to 0 users
    ],
  };

  // export const options = {
  //   // Key configurations for spike in this section
  //   stages: [
  //     { duration: '1m', target: 2000 }, // fast ramp-up to a high point
  //     // No plateau
  //     { duration: '1m', target: 0 }, // quick ramp-down to 0 users
  //   ],
  // };
  
const [{ env}] = data;
  
const { BASE_URL } = creds(env);

function getRandomPhoneNumberSuffix() {
    const minSuffix = 10000000; // Minimum 8-digit number
    const maxSuffix = 99999999; // Maximum 8-digiumber
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
      // Track HTTP request durations
      trends.submitOtp.add(submitOtpResponse.timings.duration);
      console.log('Success for registration for phone number ' + phoneNumber);
    }
    const { data: { token} } = JSON.parse(submitOtpResponse.body);
    submitOtp.add(1);
    return token;
}

function updateIsFakeUser(requestParams, phoneNumber) {
    // api to submit otp
    const updateFakeUserResponse = http.post(`${BASE_URL}/user/update-fake-user`, {}, requestParams);
    console.log(updateFakeUserResponse.status);
  
    if (updateFakeUserResponse.status!== 201) {
      throw new Error(updateFakeUserResponse.error);
    } else {
      trends.updateFakeUser.add(updateFakeUserResponse.timings.duration);
      console.log('Update Fake User Response time was ' + String(updateFakeUserResponse.timings.duration) + ' ms');
      console.log('Success for update test user api ' + phoneNumber);
    }
    updateTestUserDone.add(1);
  }


function verifyEmail(requestParams, phoneNumber) {
  // api to submit otp
  const updateFakeUser = http.post(`${BASE_URL}/user/verify-email`, {email: `${phoneNumber}@gmail.com`}, requestParams);
  console.log(updateFakeUser.status);

  if (updateFakeUser.status!== 201) {
    throw new Error(updateFakeUser.error);
  } else {
    console.log('Success for update test user api ' + phoneNumber);
  }
  updateTestUserDone.add(1);
}

function verifyEmailOTP(requestParams, phoneNumber) {
  // api to submit otp
  const updateFakeUser = http.post(`${BASE_URL}/user/verify-email`, {email: `${phoneNumber}@gmail.com`}, requestParams);
  console.log(updateFakeUser.status);

  if (updateFakeUser.status!== 201) {
    throw new Error(updateFakeUser.error);
  } else {
    console.log('Success for update test user api ' + phoneNumber);
  }
  updateTestUserDone.add(1);
}

function updatePanCard(requestParams, phoneNumber) {
    // api to submit otp
    const submitPanCardObj = {
        'panCardNumber': phoneNumber,
      };
    const updatePanCard = http.post(`${BASE_URL}/kyc/pan-verification`, JSON.stringify(submitPanCardObj), requestParams);

    console.log('updatePanCard', updatePanCard.status);

    if (updatePanCard.status!== 201) {
        console.log('Error for update test user api ', updatePanCard);
      throw new Error(updatePanCard.error);
    } else {
      trends.updatePan.add(updatePanCard.timings.duration);
      console.log('Success for update pan card user api ' + phoneNumber);
    }
    updatePanDone.add(1);
  }


function aadharVerification(requestParams, phoneNumber) {
    // api to submit otp
    const submitAadharCardObj = {
        'aadharCardNumber': phoneNumber,
      };
    const updateAadharCard = http.post(`${BASE_URL}/kyc/adhar-verification`, JSON.stringify(submitAadharCardObj), requestParams);

    console.log('updateAadharCard', updateAadharCard.status);

    if (updateAadharCard.status!== 201) {
        console.log('Error for update test user api ', updateAadharCard);
      throw new Error(updateAadharCard.error);
    } else {
      trends.updateAadhar.add(updateAadharCard.timings.duration);
      console.log('Success for update aadhar user api ' + phoneNumber);
    }
    updateAadharDone.add(1);
  }

  function getCreditLimit(requestParams, phoneNumber) {
   
    const updateCreditLimit = http.get(`${BASE_URL}/credit-analyser/check-credit-limit`, requestParams);

    console.log('updateCreditLimit', updateCreditLimit.status);

    if (updateCreditLimit.status!== 200) {
        console.log('Error for updating credit limit ', updateCreditLimit);
      throw new Error(updateCreditLimit.error);
    } else {
      trends.updateCreditLimit.add(updateCreditLimit.timings.duration);
      console.log('Success for update credit limit api ' + phoneNumber);
    }
    updateCreditLimitDone.add(1);
  }

  function getAllHospitals(requestParams, phoneNumber) {
   
    const getAllHospitals = http.get(`${BASE_URL}/hospitals?isFeatured=false&limit=10&page=1`, requestParams);

    console.log('getAllHospitals', getAllHospitals.status);

    if (getAllHospitals.status!== 200) {
        console.log('Error for getting all hospitals ', getAllHospitals);
      throw new Error(getAllHospitals.error);
    } else {
      trends.getAllHospital.add(getAllHospitals.timings.duration);
      console.log('Success for getting all hospitals ' + phoneNumber);
      gettingAllHospital.add(1);
      return JSON.parse(getAllHospitals.body).data.rows;
    }
  }

  function submitHospitalBills(requestParams, phoneNumber, billObject) {
   
    const updateHospitalBill = http.post(`${BASE_URL}/hospitals/bills`, JSON.stringify(billObject), requestParams);

    console.log('creatingHospitalBill', updateHospitalBill.status);

    if (updateHospitalBill.status!== 201) {
        console.log('Error for creating hospital bills', updateHospitalBill);
      throw new Error(updateHospitalBill.error);
    } else {
      trends.updateHospitalBill.add(updateHospitalBill.timings.duration);
      console.log('Success for getting all hospital bills ' + phoneNumber);
      updateHospitalBillDone.add(1);
      return JSON.parse(updateHospitalBill.body).data;
    }
  }

  function termList(requestParams, phoneNumber, billId) {
   
    const termsList = http.get(`${BASE_URL}/loan/terms-list?billId=${billId}`, requestParams);

    console.log('termsList', termsList.status);

    if (termsList.status!== 200) {
        console.log('Error for getting term list', termsList);
      throw new Error(termsList.error);
    } else {
      trends.termList.add(termsList.timings.duration);
      console.log('Success for getting term list ' + phoneNumber);
      termListDone.add(1);
      return JSON.parse(termsList.body).data.row;
    }
  }

  function updateHospitalBill(requestParams, phoneNumber, updateBillObject) {
   
    const updateBill = http.post(`${BASE_URL}/hospitals/update-bill`, JSON.stringify(updateBillObject), requestParams);

    console.log('updateBill', updateBill.status);

    if (updateBill.status!== 201) {
        console.log('Error for getting update bill', updateBill);
      throw new Error(updateBill.error);
    } else {
      trends.updateBill.add(updateBill.timings.duration);
      console.log('Success for getting update bill ' + phoneNumber);
      console.log('Success fot hospital bill ' + JSON.parse(updateBill.body).data);
      updateBillDone.add(1);
      return JSON.parse(updateBill.body).data;
    }
  }

  function payInterest(requestParams, phoneNumber, billObject) {   
    const payInterest = http.post(`${BASE_URL}/loan/pay-interest`, JSON.stringify(billObject), requestParams);

    if (payInterest.status!== 201) {
        console.log('Error for creating loan', payInterest);
      throw new Error(payInterest.error);
    } else {
      trends.payInterest.add(payInterest.timings.duration);
      console.log('Success for creating loan' + phoneNumber);
      payInterestDone.add(1);
      return payInterest; 
    }
  }

  function loanSummary(requestParams, phoneNumber, billId) {
   
    const loanSummary = http.get(`${BASE_URL}/hospitals/loan-final-summary?billId=${billId}`, requestParams);

    console.log('loanSummary', loanSummary.status);

    if (loanSummary.status!== 200) {
        console.log('Error for creating loan summary', loanSummary);
      throw new Error(loanSummary.error);
    } else {
      trends.loanSummary.add(loanSummary.timings.duration);
      console.log('Success for creating loan summary' + phoneNumber);
      loanSummaryDone.add(1);
      return loanSummary; 
    }
  }

  function loanListing(requestParams, phoneNumber) {
   
    const loanListing = http.get(`${BASE_URL}/loan/loan-listing?status=PENDING`, requestParams);

    console.log('loanListing', loanListing.status);

    if (loanListing.status!== 200) {
        console.log('Error for creating loan listing', loanListing);
      throw new Error(loanListing.error);
    } else {
      trends.loanListing.add(loanListing.timings.duration);
      console.log('Success for creating loan listing' + phoneNumber);
      loanListingDone.add(1);
      return loanListing; 
    }
  }


  function loanDetail(requestParams, phoneNumber, billId) {
   
    const loanDetail = http.get(`${BASE_URL}/loan/details?billId=${billId}`, requestParams);

    console.log('loanDetail', loanDetail.status);

    if (loanDetail.status!== 200) {
        console.log('Error for creating loan listing', loanDetail);
      throw new Error(loanDetail.error);
    } else {
      trends.loanDetail.add(loanDetail.timings.duration);
      console.log('Success for creating loan listing' + phoneNumber);
      loanDetailDone.add(1);
      return loanDetail; 
    }
  }

  function generateRandomNumber(max, min) {
    const randomDecimal = Math.random();
    // Scale and shift the random decimal to fit the desired range
    const randomNumber = Math.floor(randomDecimal * (max - min + 1)) + min;
    return randomNumber;
  }
 

export default function () {
    const phoneNumberSuffix = getRandomPhoneNumberSuffix().toString();
    const phoneNumber = '021' + phoneNumberSuffix;

    console.log('Registering phone number'+ phoneNumber);

    const token = register(phoneNumber);


    // console.log('Submitting token'+ token);

    const requestParams = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }};
    
    updateIsFakeUser(requestParams, phoneNumber);

    // // // verifyEmail(requestParams, phoneNumber);

    updatePanCard(requestParams, phoneNumber);

    aadharVerification(requestParams, phoneNumber);

    getCreditLimit(requestParams, phoneNumber);

    const hospitalArray = getAllHospitals(requestParams, phoneNumber);


    // Selecting a random hospital from the array
    let randomIndex = Math.floor(Math.random() * hospitalArray.length);
    let randomHospital = hospitalArray[randomIndex];

    const billObject = {
      'hospitalId': randomHospital.id ,
      'amount': 100000,
      'patientId': generateRandomNumber(10000, 50000),
      'invoiceNumber': generateRandomNumber(10000, 50000),
    }
    // if department length is 0 then choose any department
    if(randomHospital.departments.length > 0){
      billObject.departmentId = randomHospital.departments[0].id
    }
  
    const submitBill = submitHospitalBills(requestParams, phoneNumber, billObject);

    const termLists = termList(requestParams, phoneNumber, submitBill.billId);

    const updateBillObject = {
      'termId': termLists[termLists.length -1].id,
      'billId': submitBill.billId
    }
    updateHospitalBill(requestParams, phoneNumber, updateBillObject)

    const loanPayLoadObject = {
      billId: submitBill.billId,
      razorpaySignature: generateRandomNumber(10000000, 50000000),
      razorpayPaymentId: generateRandomNumber(10000000, 50000000),
      razorpayOrderId: generateRandomNumber(10000000, 50000000),
    }
    payInterest(requestParams, phoneNumber, loanPayLoadObject);

    // loanSummary(requestParams, phoneNumber, submitBill.billId);

    // loanListing(requestParams, phoneNumber);

    // loanDetail(requestParams, phoneNumber, submitBill.billId);

    // loan listing
    // loan detail


}

// Summary function
export function handleSummary(data) {
  for (const [key, value] of Object.entries(trends)) {
      console.log(`Average ${key} duration: ${value.mean} ms`);
  }
}