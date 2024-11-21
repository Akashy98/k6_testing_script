
export default function creds(env) {
    let BASE_URL;

    switch (env) {
        case 'local':
            BASE_URL = 'http://dateshala.localhost:8000/api';
            break;
        case 'sandbox':
            BASE_URL = 'https://dev.dateshala.com/api';
            break;
    };

    return {
        BASE_URL
    }
}