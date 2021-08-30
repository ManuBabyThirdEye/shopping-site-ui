import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { User } from 'src/bean/category';

@Component({
  selector: 'app-manage-admin',
  templateUrl: './manage-admin.component.html',
  styleUrls: ['./manage-admin.component.scss']
})
export class ManageAdminComponent implements OnInit {

  adminList : Array<User> = [];
  addAdmin : boolean = false;
  mobileNumber : string;
  constructor(private categoryService : CategoryService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.getAllAdmin();
  }
  getAllAdmin() {
    this.ngxService.start();
    this.categoryService.getAdmins().then(docs=>{
      this.adminList = docs.docs.map(doc=>{
        let user = doc.data() as User;
        user.mobileNumber = doc.id;
        return user;
      });
      this.ngxService.stop();
    });
  }

  addNewAdmin(){
    let numnber;
    if(this.mobileNumber){
      if(this.mobileNumber.startsWith("+91") && this.mobileNumber.length==13){
        numnber = this.mobileNumber;
      } else if(this.mobileNumber.length==10){
        numnber = "+91"+this.mobileNumber;
      }
      if(numnber){
        this.ngxService.start();
        this.categoryService.upgradUserToAdmin(numnber).then(res=>{
          if(res){
            this.toastr.success(numnber+" upgrad to admin");
            this.getAllAdmin();
          }else{
            this.toastr.error(numnber+" user is not available in our DB, ask this user to login")
          }
          this.addAdmin=!res;
          this.ngxService.stop();
        });
      }
    }
  }

  deleteAdmin(admin : User){
    this.ngxService.start();
    this.categoryService.downgradUserFromAdmin(admin.mobileNumber).then(res=>{
      this.toastr.success(admin.mobileNumber+" removed from admin group");
      this.ngxService.stop();
      this.getAllAdmin();
    });
  }

}
