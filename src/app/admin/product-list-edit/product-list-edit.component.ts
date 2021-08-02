import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { Category, MainCategory, Product, SubCategory } from 'src/bean/category';

@Component({
  selector: 'app-product-list-edit',
  templateUrl: './product-list-edit.component.html',
  styleUrls: ['./product-list-edit.component.scss']
})
export class ProductListEditComponent implements OnInit {

  mainCategoryList : Array<MainCategory>;
  selectedMainCat : MainCategory;
  selectedCat : Category;
  selectedSubCat : SubCategory;
  products : Array<Product> = [];

  constructor(private route: ActivatedRoute,
    private router : Router,
    private categoryService : CategoryService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService) { 
    this.categoryService.getAllCategoryList().then(catDoc=>{
      this.mainCategoryList = catDoc.docs.map(cat=>{
        let mainCate : MainCategory =  cat.data() as MainCategory;
        mainCate.id = cat.id;
        return mainCate;
      });
      this.ngxService.stop();
    })
  }

  ngOnInit(): void {
  }

  selectMainCat(mainCat : MainCategory){
    this.selectedMainCat = mainCat;
    this.selectedCat = undefined;
    this.selectedSubCat = undefined;
  }
  selectedCategory(cat : Category){
    this.selectedCat=cat;
    this.selectedSubCat = undefined;
    this.getProducts(cat.id);
  }
  getProducts(id: string) {
    this.ngxService.start()
    this.categoryService.getProductList(id,"discount",'desc').then(res => {
      this.products = res.docs.map(d=>{
        let p = d.data() as Product;
        p.id = d.id;
        return p;
      });
      this.ngxService.stop()
    }).catch(e=>{
      this.ngxService.stop()
    })
  }
  selectedSubCategory(subCat : SubCategory){
    this.selectedSubCat = subCat;
    this.getProducts(subCat.id);
  }
  addNewProducts(){
    this.router.navigate(['/admin/product-add-edit'],{queryParams : {categoryId:this.selectedSubCat?this.selectedSubCat.id:this.selectedCat.id}});
  }

  editProduct(pro : Product){
    this.router.navigate(['/admin/product-add-edit'],{queryParams : {productId : pro.id,categoryId:this.selectedSubCat?this.selectedSubCat.id:this.selectedCat.id}});
  }

  deleteProduct(pro : Product){

  }

  hideProduct(pro : Product){

  }

}
