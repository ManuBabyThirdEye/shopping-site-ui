// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: true,
    themeColor : "#e4498a",
    adminNumber : "8714443741",
    gstNumber : "",
    icon : "assets/logo.png",
    appName:"Test",
    firebaseConfig : {
      apiKey: "AIzaSyC8ZkhyjUy6n0uhY0rRjILTC4Ypj5b4TzY",
      authDomain: "rithum-15823.firebaseapp.com",
      projectId: "rithum-15823",
      storageBucket: "rithum-15823.appspot.com",
      messagingSenderId: "888931391161",
      appId: "1:888931391161:web:14f91092893ce2d551ed68",
      measurementId: "G-Z22E3HBDH6"
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
  