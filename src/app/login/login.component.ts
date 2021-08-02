import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import firebase from "firebase/app";
import "firebase/auth";
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit,AfterViewInit {

  recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  recaptchaWidgetId : any;
  mobileNumber : string = "";
  recaptchaVerifierResponse = undefined;
  showLogin :boolean = false;

  constructor(private authService: AuthService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService) { 
      window.scroll(0,0);
  }
  ngAfterViewInit(): void {
    this.recaptchaVerifierVisible();
    this.recaptchaVerifier.render().then((widgetId) => {
      this.recaptchaWidgetId = widgetId;
    });
  }

  login(){
    if(this.recaptchaVerifierResponse && this.verifyPhoneNUmber(this.mobileNumber)){
      this.ngxService.start();
      this.authService.sendOtp("+91"+this.mobileNumber,this.recaptchaVerifier).then(res=>{
        this.ngxService.stop();
        this.router.navigate(['/otp'],{queryParams : {mobileNumber:"+91"+this.mobileNumber,verificationId:res.verificationId}})
      });
    }
  }
  verifyPhoneNUmber(mobileNumber: string) {
    var phoneno = /^\d{10}$/;
    if(mobileNumber.length!=10){
      this.toastr.error("Enter 10 digit mobile number")
      return false;
    }
    if(!mobileNumber.match(phoneno)){
      this.toastr.error("Worng mobile number")
      return false;
    }
    return true;
  }

  recaptchaVerifierVisible() {
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'normal',
      'callback': (response) => {
        this.recaptchaVerifierResponse = response;
        this.showLogin = true;
      },
      'expired-callback': () => {
        
      }
    });
  }

  ngOnInit(): void {
    
  }

}
