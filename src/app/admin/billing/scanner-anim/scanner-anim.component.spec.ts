import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerAnimComponent } from './scanner-anim.component';

describe('ScannerAnimComponent', () => {
  let component: ScannerAnimComponent;
  let fixture: ComponentFixture<ScannerAnimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScannerAnimComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannerAnimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
