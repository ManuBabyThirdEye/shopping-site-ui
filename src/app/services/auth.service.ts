import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import firebase from "firebase/app";
import { Observable } from 'rxjs';
import { User } from 'src/bean/category';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  
  
  public signedIn: Observable<any>;

  USER_TABLE : string = 'user';


  constructor(private firebaseAuth: AngularFireAuth,private firebaseStore: AngularFirestore) { 
    firebase.initializeApp(environment.firebaseConfig);
    this.signedIn = new Observable((subscriber) => {
      this.firebaseAuth.onAuthStateChanged(subscriber);
    });
  }

  logout() : Promise<void>{
    return this.firebaseAuth.signOut();
  }
  

  sendOtp(phoneNumber: string,applicationVerifier: firebase.auth.ApplicationVerifier) : Promise<firebase.auth.ConfirmationResult>{
    return this.firebaseAuth.signInWithPhoneNumber(phoneNumber,applicationVerifier)
  }

  loginWithOtp(verificationId: string, otp : string) :Promise<firebase.auth.UserCredential> {
    var credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
     return this.firebaseAuth.signInWithCredential(credential);
  }

   getUserFromFirestore(phoneNumber: string) : Promise<firebase.firestore.DocumentSnapshot<unknown>> {
    return this.firebaseStore.collection(this.USER_TABLE).doc(phoneNumber).get().toPromise();
  }

  addUserToFirebase(mobileNumber: string, name: string, email: string) {
    return this.firebaseStore.collection(this.USER_TABLE).doc(mobileNumber).set({name:name,email:email,admin:false});
  }

}
