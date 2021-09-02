import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-select-size',
  templateUrl: './select-size.component.html',
  styleUrls: ['./select-size.component.scss']
})
export class SelectSizeComponent implements OnInit {

  selectedSize : string;
  sizeList : Array<string> = ['S','M','L','XL','XXL','XXXL'];

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  selectSize(size){
    this.selectedSize = size;
  }

  updateSize(){
    this.activeModal.close(this.selectedSize);
  }

}
