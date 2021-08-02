import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoPrevilageComponent } from './no-previlage.component';

describe('NoPrevilageComponent', () => {
  let component: NoPrevilageComponent;
  let fixture: ComponentFixture<NoPrevilageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoPrevilageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoPrevilageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
