const fs = require("fs");

const serviceKey = {
  type: "service_account",
  project_id: "real-estate-dealer-961f9",
  private_key_id: "8dba5342fd3c6debba79bf410edb084c80b418c6",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDiEAxYGH5LlRN9\ns+Lgv1KiRW5BYEw2LieMVoYRXaBTZkfEqGb1Mj9BqFxzMG0jT5J1weG5AIj6+2Ce\nz0cjvtSEKeLeWJgHEchttIFUsMdzt5+t/oPpGCyXEKx2E2uRxOu4Rj0+SKhfemCg\n+XGiY1Gza5y5ODF7jpl1xH/yDDkxASeeiPqPG5PuisaCRZwu0DC8ldZyLh5IDsb6\n1L1f/G/iBet8iY4Y6s8OOZvJkVR+dMvEtJrydN2MaJEUqj6jCm4CVIW82d+HZcss\n/ttG+eCFmLgzT7TRPKzBw2JDTj0Y5/xs4zHlzMOZ3c6UmsHxE1vu6XHrxYy6/swL\nck8MpNOHAgMBAAECggEATkREIdQJFd39K442RJ243FmxfIz8ld2Q77OdIzIJKhbF\nTj8Htmi5IeBKcc8YWhtYl9CSd9zJkCusHg+hj6yoI0HlPBnsOLZdcC4IgOvbgiLW\n9ASkYvVtqrepHhBHM+a7vccDuSaqtLPH9LOoNhKw3K+rSS09ZIvQccegjIrS2jXn\nedAKIx5D0fj0Tjpbj+6t+Esnh8gI0LvmzVEuhWZJI8fNqu0TPimol1tqfVqkWaCI\nUqpzwrI9nKtLAGt4/AcVXREz4TyUxsdL79vX5urAoKVr2rGAIUmHdz6C7V/jPo2P\nuhKT4Qd5C6oui+5GOcOjAQolqowkfv/8jrWhG8g6QQKBgQD4X5H8lWJTTvjY+1+u\n2ZHF4ne98KbmtcYF3Ig8jiicFCl8x+zqbzkzQDnJpDT3v05WrcgPR7/rhYbXgyvP\nblkgLki6VVzrkMqgQp+uNl/595i2CBDR48S21j4wai1cllhlcy3ATa4ICfU8ANaq\nSChomkWy+k6cyY556LR6bsx2twKBgQDpARjXFTnRN5qz1mMev0Bhs8RViKQduc9c\nIE6r2DRJY7/wZqQyWZm0Kda7UvOvwqNJnaaiZj6cbXO5ZBw8+1TidlmK+eg/2004\nVCLuH1nvF067bSSLNWMaIMvpWRuiiqFM1LimBGTueoDFajbsiaTsMURsXrn9G7KT\nolJsU+g5sQKBgQCuQX8PE0+020dEFLkA16yqhUU1gc3XN9kC68K5mZNsTcj9vta9\nc+NRzdG9YvO2jgXMUoh2EATanQgJ1AG8utLU/SQRdyqGK0O+RH/7njKgEdKWg/op\nCABPtuhS12uT9fd21eRXcyiSg0oHGx+AwLd5DCOyemMFJXRMm7Nj4rCY6QKBgQCh\nf/oosnSluCXJetKvMB6+2aw/IPuoAu9gSqBc6fmr2LDkPzCWGZa40rscke2IKJ+n\nWddy/u1s3Ux19pbACfCXGzMLahZ5lFacsWyYojBi0UPoE0leF/390TelIPdPnUka\nCOOHZspSpaR1sR4qq2kdsTRc7Pd7IWSQgdUhcrMmsQKBgAOs0vZxRI4HKvVxvVlz\nDu7pDzB0yhY1Im49nPy/6JKPjvL1AJp9eSf2fZSo1RzhC+D4Ng/sm+kIB9FWhrUW\n8/RlJ0NLhs2OSYsjsUHZHv+ENNcJncL0dYP7HFur+WWrdtj/qkrG1bXwKEVs/bLj\nReZmP52DDuyehfGBC0nl7H6U\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@real-estate-dealer-961f9.iam.gserviceaccount.com",
  client_id: "106710276424550390931",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40real-estate-dealer-961f9.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

const encoded = Buffer.from(JSON.stringify(serviceKey)).toString("base64");

fs.writeFileSync(".env.local", `FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY=${encoded}\n`);
console.log("✅ Service account key encoded and saved to .env.local");