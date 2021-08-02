import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-box',
  templateUrl: './confirm-box.component.html',
  styleUrls: ['./confirm-box.component.scss']
})
export class ConfirmBoxComponent implements OnInit {

  @Input() showClose : boolean;
  @Input() image : string;
  @Input() heading : string;
  @Input() details : string;
  @Input() positiveText : string;
  @Input() negativeText : string;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  positiveResponce(){
    this.activeModal.close(true);
  }

  negativeResponce(){
    this.activeModal.close(false);
  }

  close(){
    this.activeModal.dismiss();
  }

}
