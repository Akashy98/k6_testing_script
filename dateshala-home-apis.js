import http from 'k6/http';
import { check } from 'k6';
import checkResponse from './helpers/check-response.js';

export default function (BASE_URL, requestParams, phoneNumber, myApplicationDone, homeApiDone) {
    const myApplicationResponse = http.get(`${BASE_URL}/hospitals/my-applications?limit=10&page=1`, requestParams);

      if (myApplicationResponse.status!== 200) {
        throw new Error(myApplicationResponse.error);
      } else {
        console.log('Success for my application for phone number ' + phoneNumber);
      }
      myApplicationDone.add(1);

      check(myApplicationResponse, {
        'user successfully hit my application api': checkResponse
    });

    const homeResponse = http.get(`${BASE_URL}/home`, requestParams);
    check(homeResponse, {
        'response status of getting home by match is 200': homeResponse
    });
    if (homeResponse.status!== 200) {
        throw new Error(homeResponse.error);
      } else {
        console.log('Success for home api for phone number ' + phoneNumber);
      }
      homeApiDone.add(1);

    check(homeResponse, {
        'user successfully hit expert apis': homeResponse
    });
}