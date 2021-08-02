import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCategoryListComponent } from './update-category-list.component';

describe('UpdateCategoryListComponent', () => {
  let component: UpdateCategoryListComponent;
  let fixture: ComponentFixture<UpdateCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateCategoryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
