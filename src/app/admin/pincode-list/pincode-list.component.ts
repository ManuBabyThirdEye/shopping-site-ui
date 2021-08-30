import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AddPincodeComponent } from 'src/app/app-modal/add-pincode/add-pincode.component';
import { ConfirmBoxComponent } from 'src/app/app-modal/confirm-box/confirm-box.component';
import { CategoryService } from 'src/app/services/category.service';
import { PinCode } from 'src/bean/category';

@Component({
  selector: 'app-pincode-list',
  templateUrl: './pincode-list.component.html',
  styleUrls: ['./pincode-list.component.scss']
})
export class PincodeListComponent implements OnInit {

  pincodeList : Array<PinCode>= [];

  constructor(private categoryService : CategoryService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private modalService: NgbModal) { 
      this.updatePincodeList();
      
  }
  updatePincodeList() {
    this.ngxService.start();
      this.categoryService.getAllPincodes().then(docs => {
        this.pincodeList = docs.docs.map(doc=>{
          let pin = doc.data() as PinCode;
          pin.pincode = doc.id;
          return pin;
        });
        this.ngxService.stop();
      });
  }

  ngOnInit(): void {
  }

  addNewPincode(){
    const modalRef = this.modalService.open(AddPincodeComponent);    
    modalRef.result.then((result:PinCode)=>{
      if(result){
        result.available = true;
        this.ngxService.start();
        this.categoryService.addNewPincode(result).then(()=>{
          this.ngxService.stop();
          this.toastr.success("Pincode added successfully");
          this.updatePincodeList();
        })
      }
    }).catch(e=>{
      
    })
  }
  editPincode(poincode:PinCode){
    const modalRef = this.modalService.open(AddPincodeComponent);    
    modalRef.componentInstance.pinDetails = poincode;

    modalRef.result.then((result:PinCode)=>{
      if(result){
        console.log(result);
        this.ngxService.start();
        this.categoryService.editPincode(result).then(()=>{
          this.ngxService.stop();
          this.toastr.success("Pincode edited successfully");
          this.updatePincodeList();
        })
      }
    }).catch(e=>{
      
    })
  }
  deletePincode(poincode:PinCode){
    const confirmCancel = this.modalService.open(ConfirmBoxComponent);
    confirmCancel.componentInstance.image = "../../assets/placeholder.png";
    confirmCancel.componentInstance.heading = "Delete";
    confirmCancel.componentInstance.details = "Are you sure you want to delete this pincode?";
    confirmCancel.componentInstance.positiveText = "YES";
    confirmCancel.componentInstance.negativeText = "NO";

    confirmCancel.result.then(result=>{
      if(result){
        this.ngxService.start();
        this.categoryService.deletePincode(poincode).then(()=>{
          this.ngxService.stop();
          this.updatePincodeList();
        });
      }
    }).catch(e=>{
      
    });
  }

  checkActive(poincode:PinCode){
    this.ngxService.start();
      this.categoryService.updateActiveStatePincode(poincode).then(docs => {
        this.ngxService.stop();
      });
  }

}
