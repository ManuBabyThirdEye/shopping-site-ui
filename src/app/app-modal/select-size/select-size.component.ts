import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-select-size',
  templateUrl: './select-size.component.html',
  styleUrls: ['./select-size.component.scss']
})
export class SelectSizeComponent implements OnInit {

  @Input() maxCount : number = 0;

  sizeList : Array<number> = [];
  selectedSize : number;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    for(let i=1;i<=this.maxCount;i++){
      this.sizeList.push(i);
    }
  }

  selectSize(size){
    this.selectedSize = size;
  }

  updateSize(){
    this.activeModal.close(this.selectedSize);
  }

}
