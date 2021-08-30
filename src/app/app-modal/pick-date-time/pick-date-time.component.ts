import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pick-date-time',
  templateUrl: './pick-date-time.component.html',
  styleUrls: ['./pick-date-time.component.scss']
})
export class PickDateTimeComponent implements OnInit {

  date : string;
  time : string;

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    var datePipe = new DatePipe("en-US");
    this.date = datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.time = datePipe.transform(new Date(), 'HH:mm');
    console.log(this.date);
  }

  selectNow(){
    this.activeModal.close(new Date());
  }

  selectDateTimePicker(){
    this.activeModal.close(new Date(this.date+" "+this.time));
  }

}
