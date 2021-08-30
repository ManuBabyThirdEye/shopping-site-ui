import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPincodeComponent } from './add-pincode.component';

describe('AddPincodeComponent', () => {
  let component: AddPincodeComponent;
  let fixture: ComponentFixture<AddPincodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPincodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPincodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
