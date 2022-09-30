// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: true,
    local : false,
    themeColor : "#e4498a",
    adminNumber : "8714443741",
    gstNumber : "",
    icon : "assets/logo.png",
    appName:"Electronics",
    firebaseConfig : {
        apiKey: "AIzaSyB71L6MOmNYj1eVW4CnSe5AlnR828pBm3g",
        authDomain: "electronics-82819.firebaseapp.com",
        projectId: "electronics-82819",
        storageBucket: "electronics-82819.appspot.com",
        messagingSenderId: "209850715100",
        appId: "1:209850715100:web:05631eda725e8743c65d19",
        measurementId: "G-H744Z0NK13"
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
  