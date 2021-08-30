import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PinCode } from 'src/bean/category';

@Component({
  selector: 'app-add-pincode',
  templateUrl: './add-pincode.component.html',
  styleUrls: ['./add-pincode.component.scss']
})
export class AddPincodeComponent implements OnInit {

  @Input() pinDetails : PinCode;

  pinData: FormGroup;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.pinData = new FormGroup({
      pincode: new FormControl(""),
      district: new FormControl(""),
      state: new FormControl(""),
      pinCodeDeliveryDelay: new FormControl(0),
      convenienceFee: new FormControl(0),
      minOrderAmount: new FormControl(0),
      codAvailable : new FormControl(false),
      returnAvailable : new FormControl(false)
    });
    if(this.pinDetails){
      this.pinData.patchValue({
        pincode : this.pinDetails.pincode,
        district : this.pinDetails.district,
        state : this.pinDetails.state,
        pinCodeDeliveryDelay : this.pinDetails.pinCodeDeliveryDelay,
        convenienceFee : this.pinDetails.convenienceFee,
        minOrderAmount : this.pinDetails.minOrderAmount,
        codAvailable : this.pinDetails.codAvailable,
        returnAvailable : this.pinDetails.returnAvailable
      });
    }
  }

  onClickSubmit(value){
    if(this.pinData.valid){
      this.activeModal.close(value);
    }
  }
}
