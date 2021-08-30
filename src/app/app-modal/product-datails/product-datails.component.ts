import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Product } from 'src/bean/category';

@Component({
  selector: 'app-product-datails',
  templateUrl: './product-datails.component.html',
  styleUrls: ['./product-datails.component.scss']
})
export class ProductDatailsComponent implements OnInit {

  @Input() size: string;

  productData: FormGroup;
  count: number = 1;
  constructor(public activeModal: NgbActiveModal) { 
    this.productData = new FormGroup({
      name: new FormControl(""),
      details: new FormControl(""),
      discountPrice: new FormControl(0),
      discount: new FormControl(0)
   });
  }

  onClickSubmit(value){
    
    if(this.productData.valid){
      value['discountPrice'] = parseInt(value['discountPrice']);
      value['discount'] = parseInt(value['discount']);
      console.log(value as Product);
      this.activeModal.close(value as Product);
    }
  }

  ngOnInit(): void {
  }

}
