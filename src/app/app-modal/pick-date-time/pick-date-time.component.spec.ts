import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickDateTimeComponent } from './pick-date-time.component';

describe('PickDateTimeComponent', () => {
  let component: PickDateTimeComponent;
  let fixture: ComponentFixture<PickDateTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickDateTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
