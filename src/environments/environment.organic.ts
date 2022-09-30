// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --organic` replaces `environment.ts` with `environment.organic.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    local : false,
    themeColor : "#e4498a",
    adminNumber : "8714443740",
    gstNumber : "",
    icon : "assets/organic_icon.png",
    appName:"Sesame Organic",
    firebaseConfig : {
        apiKey: "AIzaSyBq0EVGGhCunErbJ901qbpEPO6eCqUL7sA",
        authDomain: "organic-sesame.firebaseapp.com",
        projectId: "organic-sesame",
        storageBucket: "organic-sesame.appspot.com",
        messagingSenderId: "218990948091",
        appId: "1:218990948091:web:7cc695d43e6033022f8a5e",
        measurementId: "G-TL55HKCXF8"
    },
    googlePayPaymentRequest : {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'VISA', 'MASTERCARD']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          }
        }
      ],
      merchantInfo: {
        merchantId: '12345678901234567890',
        merchantName: 'Demo Merchant'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPriceLabel: 'Total',
        totalPrice: '100.00',
        currencyCode: 'INR',
        countryCode: 'IN'
      },
      callbackIntents : ['PAYMENT_AUTHORIZATION']
    }
  };
  
  
  /*
   * For easier debugging in development mode, you can import the following file
   * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
   *
   * This import should be commented out in production mode because it will have a negative impact
   * on performance if an error is thrown.
   */
  // import 'zone.js/dist/zone-error';  // Included with Angular CLI.
  