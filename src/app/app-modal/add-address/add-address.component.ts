import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { Address, PinCode } from 'src/bean/category';

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.scss']
})
export class AddAddressComponent implements OnInit {

  @Input() address : Address;

  addressData: FormGroup;
  district: string = "District";
  state: string = "State";
  pinNotAvailable : boolean = false;
  errorCode : string = "Pin code not under our view";
  validatedPin:boolean=false;


  constructor(public activeModal: NgbActiveModal,
    private categoryService: CategoryService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService) {}

  ngOnInit(): void {
    this.addressData = new FormGroup({
      name: new FormControl(""),
      mobileNumber: new FormControl(""),
      address: new FormControl(""),
      town: new FormControl(""),
      pinCode: new FormControl("")
   });
   if(this.address){
    this.addressData.patchValue({
      name : this.address.name,
      mobileNumber : this.address.mobileNumber,
      address : this.address.address,
      town : this.address.town,
      pinCode : this.address.pinCode
    });
    this.pincodeEnter();
   }

  }

  pincodeEnter(){
    let pinCode:string = this.addressData.get("pinCode").value;
    this.pinNotAvailable = false;
    this.district = "District";
    this.state = "State";
    if(pinCode.length == 6){
      this.categoryService.getPincodeAvailable(pinCode).then(pin => {
        if(pin.exists){
          let picDetails = pin.data() as PinCode; 
          this.pinNotAvailable = !picDetails.available;
          this.district = picDetails.district;
          this.state = picDetails.state;
          localStorage.setItem("pincode",pinCode);
        }else{
          this.pinNotAvailable = true;
          this.errorCode = "Unfortunately we do not ship to your pin code";
        }
      })
    }
  }

  onClickSubmit(value){
    
    if(this.addressData.valid && !this.pinNotAvailable){
      value["district"] = this.district;
      value["state"] = this.state;
      console.log(value);
      this.activeModal.close(value);
    }
  }
  validateInputs(): boolean {
    return this.addressData.valid;
  }

}
