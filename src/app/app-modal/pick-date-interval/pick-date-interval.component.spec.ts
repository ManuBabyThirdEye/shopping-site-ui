import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickDateIntervalComponent } from './pick-date-interval.component';

describe('PickDateIntervalComponent', () => {
  let component: PickDateIntervalComponent;
  let fixture: ComponentFixture<PickDateIntervalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickDateIntervalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickDateIntervalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
