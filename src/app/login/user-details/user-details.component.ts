import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {

  name : string;
  email : string;
  mobileNumber : string;
  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private ngxService: NgxUiLoaderService) { 
    this.route.queryParams.subscribe(params => {
      this.mobileNumber = params.mobileNumber;
      window.scroll(0,0);
    });
  }

  ngOnInit(): void {
  }

  addUserDetails(){
    this.ngxService.start();
    this.authService.addUserToFirebase(this.mobileNumber,this.name,this.email).then(res=>{
      this.ngxService.stop();
      this.router.navigate(['']).then(r=>{
        window.location.reload();
      })
    })
  }

}
