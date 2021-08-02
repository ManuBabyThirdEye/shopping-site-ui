import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Category, MainCategory, SubCategory } from 'src/bean/category';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit,OnChanges {

  @Input() categoryList : MainCategory;

  pageClass : string = 'col-md-12';

  categoryArray : Array<Array<Category>> = [];

  constructor() { }

  ngOnInit(): void {
    
  }

  ngOnChanges(): void{
    this.categoryArray = [];  
    if(this.categoryList){
      this.pageClass = this.getDivision(this.categoryList.pageCount);
      for(let i=1;i<=this.categoryList.pageCount;i++){
        this.categoryArray.push(this.categoryList.categories.filter(c=>c.page==i).sort((c1,c2)=>c1.order-c2.order));
      }
    }  
    
  }

  getPageClass(index){
    return this.getDivision(this.categoryList.pageCount)+(index%2!=0?' even-background':'')
  }

  getDivision(pageCount){
    switch(pageCount){
      case 1 : return 'col-md-12';
      case 2 : return 'col-md-6';
      case 3 : return 'col-md-4';
      case 4 : return 'col-md-3';
      case 5 : return 'col-md-2';
      case 6 : return 'col-md-2';
    }
    return 'col-md-12';
  }
}
