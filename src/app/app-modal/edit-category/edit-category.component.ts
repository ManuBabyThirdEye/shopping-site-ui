import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Address } from 'cluster';
import { Category } from 'src/bean/category';
import { ConfirmBoxComponent } from '../confirm-box/confirm-box.component';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit {

  @Input() category : Category;
  @Input() heading : string;
  @Input() showPage : boolean;
  @Input() pageLabel : string;

  catData: FormGroup;

  constructor(public activeModal: NgbActiveModal,
    private modalService: NgbModal  ) { }

  ngOnInit(): void {
    this.catData = new FormGroup({
      name: new FormControl(""),
      order: new FormControl(""),
      page: new FormControl(this.showPage?"":"0"),
   });
   if(this.category){
    this.catData.patchValue({
      name : this.category.name,
      order : this.category.order,
      page : this.showPage?this.category.page:0
    });
   }
  }

  onClickSubmit(value){
    if(this.catData.valid){
      this.activeModal.close(value);
    }
  }

  deleteCategory(){
    const confirmRemoveCart = this.modalService.open(ConfirmBoxComponent);
    confirmRemoveCart.componentInstance.image = "../../assets/diagram.png";
    confirmRemoveCart.componentInstance.heading = "Remove Category";
    confirmRemoveCart.componentInstance.details = "Are you sure you want to remove this "+this.heading+"?";
    confirmRemoveCart.componentInstance.positiveText = "REMOVE";
    confirmRemoveCart.componentInstance.negativeText = "CANCEL";
    confirmRemoveCart.componentInstance.showClose = true;

    confirmRemoveCart.result.then(result=>{
      if(result){
        this.activeModal.close(undefined);
      }
    });
  }

}
