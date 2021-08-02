import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "firebase/auth";
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit {

  timmerString : string ="00:00";
  showResendOption : boolean = false;
  time: number = 30;
  interval:any;
  mobileNumber:string;
  verificationId : string;
  otp1 : string; otp2 : string; otp3 : string; otp4 : string; otp5 : string; otp6 : string;

  constructor(private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService) { 
    this.route.queryParams.subscribe(params => {
      this.mobileNumber = params.mobileNumber;
      this.verificationId = params.verificationId;
      window.scroll(0,0);
    });
  }

  ngOnInit(): void {
    this.sendOtpToMobileNumber(this.mobileNumber)
  }
  sendOtpToMobileNumber(mobileNumber: string) {
    this.startTimer();
  }

  @HostListener('keyup', ['$event']) onKeyDown(e: any) {
    if (e.srcElement.maxLength === e.srcElement.value.length) {
        e.preventDefault();
        let nextControl: any = e.srcElement.nextElementSibling;
        if (nextControl){
          nextControl.focus();
          return;
        }else{
          this.verifyOtp();
        }
    }else if(e.srcElement.value.length == 0){
      e.preventDefault();
      let nextControl: any = e.srcElement.previousElementSibling;
      if (nextControl){
        nextControl.focus();
        return;
      }
    }
  }
  verifyOtp() {
    this.ngxService.start();
    let otp = this.getOtpFromInput();
    console.log(this.verificationId);
    this.authService.loginWithOtp(this.verificationId,otp).then(response => {
      this.authService.getUserFromFirestore(this.mobileNumber).then(user=>{
        if(user.exists){
          this.router.navigate(['']).then(r=>{
            window.location.reload();
          })
        }else{
          this.router.navigate(['user-details'],{queryParams : {mobileNumber:this.mobileNumber}}).then(r=>{
            window.location.reload();
          })
        }
        this.ngxService.stop();
      }).catch(e=>{
        this.ngxService.stop();
        this.toastr.error("Error while reading user details")
      })
      
    }).catch(e=>{
      this.ngxService.stop();
      this.toastr.error("Invalid OTP")
    })

  }
  getOtpFromInput() : string {
    return ""+this.otp1+this.otp2+this.otp3+this.otp4+this.otp5+this.otp6;
  }

  startTimer() {
    this.time = 30;
    this.showResendOption = false;
    this.interval = setInterval(() => {
      this.time--;
      this.timmerString = this.createTimerString(this.time);
      if(this.time<=0){
        this.showResendOption = true;
        clearInterval(this.interval);
      }
    },1000)
  }
  createTimerString(time: number): string {
    return "00:"+(time<10?"0"+time:time);
  }

}
