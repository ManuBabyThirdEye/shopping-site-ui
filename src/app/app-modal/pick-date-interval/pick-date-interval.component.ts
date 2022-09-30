import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pick-date-interval',
  templateUrl: './pick-date-interval.component.html',
  styleUrls: ['./pick-date-interval.component.scss']
})
export class PickDateIntervalComponent implements OnInit {

  fromDate : string;
  toDate : string;

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    var datePipe = new DatePipe("en-US");
    this.fromDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.toDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
    console.log(this.fromDate);
  }

  selectNow(){
    this.activeModal.close(new Date());
  }

  selectDateTimePicker(){
    this.activeModal.close(this.fromDate+":"+this.toDate);
  }

}
