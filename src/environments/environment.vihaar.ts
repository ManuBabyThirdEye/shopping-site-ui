// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    themeColor : "#e4498a",
    adminNumber : "9895148030",
    gstNumber : "",
    icon : "assets/vihaar.png",
    appName:"Vihaar",
    firebaseConfig : {
        apiKey: "AIzaSyBirvFzb7z2wthNLVXMwyI9IQGEoWTwidU",
        authDomain: "vihaar-fa300.firebaseapp.com",
        projectId: "vihaar-fa300",
        storageBucket: "vihaar-fa300.appspot.com",
        messagingSenderId: "248477207223",
        appId: "1:248477207223:web:75f34cee14223266d39b32",
        measurementId: "G-TWSGWMCYNP"
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
  