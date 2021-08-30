import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SelectSizeComponent } from 'src/app/app-modal/select-size/select-size.component';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { Category, MainCategory, Product, Size, SubCategory } from 'src/bean/category';
import { StringLiteralLike } from 'typescript';

@Component({
  selector: 'app-product-add-edit',
  templateUrl: './product-add-edit.component.html',
  styleUrls: ['./product-add-edit.component.scss']
})
export class ProductAddEditComponent implements OnInit {

  categoryId : string;
  productId : string;
  product : Product;
  showInfo: boolean = true;
  nameEdit : boolean = false;
  detailsEdit : boolean = false;
  amountEdit : boolean = false;
  delayEdit : boolean = false;
  editedName : string;
  editedDetails : string;
  editedDiscountedAmount : number;
  editedDiscount : number;
  editedDeliveryDelay : number;
  oldImages = ["../../assets/logo.png","../../assets/logo.png","../../assets/logo.png","../../assets/logo.png"];
  mainCategoryList:Array<MainCategory>;
  linkedCategoriesNameMap : Map<string,string>;
  selectedImages:Array<any>=[undefined,undefined,undefined,undefined];
  selectedMainCat : MainCategory;
  selectedCat : Category;
  selectedSubCat : SubCategory;
  addNewCategory : boolean = false;

  constructor(private route: ActivatedRoute,
    private categoryService : CategoryService,
    private productService : ProductService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private modalService: NgbModal) { 
      window.scroll(0,0);
    this.route.queryParams.subscribe(params => {
      this.categoryId = params.categoryId;
      this.productId = params.productId; 
    });
    this.categoryService.getAllCategoryList().then(catDoc=>{
      this.mainCategoryList = catDoc.docs.map(cat=>{
        let mainCate : MainCategory =  cat.data() as MainCategory;
        mainCate.id = cat.id;
        return mainCate;
      });
      if(this.productId){
        this.ngxService.start();
        this.productService.getProduct(this.productId).then(p=>{
          this.product = p;
          if(!this.product.details){
            this.product.details = "Double click to add details here";
          }
          if(!this.product.name){
            this.product.name = "Double click to add name here";
          }
          this.linkedCategoriesNameMap = this.getLinkedCategoriesName();
          this.ngxService.stop();
        })
      }else{
        this.product = {
          name : "Double click to add name here",
          details : "Double click to add details here",
          discount : 0,
          availableSizeString : "",
          availableSizes : [],
          discountPrice : 0,
          id : "new",
          images : ["../../assets/logo.png","../../assets/logo.png","../../assets/logo.png","../../assets/logo.png"],
          productDeliveryDelay : 0,
          rating : 0,
          isWishList : false,
          reviews : [],
          category : []
        }
        this.ngxService.stop();
      }
    })
    
  }
  getLinkedCategoriesName(): Map<string,string> {
    let linkedItems = new Map();
    if(this.product.category && this.product.category.length>0){
      this.product.category.forEach(c=>{
        if(this.mainCategoryList && this.mainCategoryList.length>0){
          this.mainCategoryList.forEach(mc=>{
            if(mc.id==c){
              linkedItems.set(c,mc.name);
              return;
            }
            if(mc.categories && mc.categories.length>0){
              mc.categories.forEach(cc=>{
                if(cc.id==c){
                  linkedItems.set(c,mc.name+" -- "+cc.name);
                  return;
                }
                if(cc.subCategories && cc.subCategories.length>0){
                  cc.subCategories.forEach(sc=>{
                    if(sc.id==c){
                      linkedItems.set(c,mc.name+" -- "+cc.name+" -- "+sc.name);
                      return;
                    }
                  });
                }
              });
            }   
          })
        }
      })
    }
    console.log(linkedItems)
    return linkedItems;
  }

  ngOnInit(): void {
  }

  addOrUpdateProduct(){
    this.product.availableSizeString = this.getAvailableSizes(this.product.availableSizes);
   
      if(this.selectedImages.find(i=>i==undefined)){
        this.toastr.error("Please add 4 images of the product");
        return;
      }
      if(this.product.name == 'Double click to add name here'){
        this.toastr.error("Enter valid name");
        return;
      }
      if(!this.product.discountPrice){
        this.toastr.error("Enter valid amount");
        return;
      }
      if(this.product.details == 'Double click to add details here'){
        this.product.details = "";
      }
    if(this.product.id=="new"){
        this.product.category.push(this.categoryId);
        this.ngxService.start();
        this.productService.addNewProduct(this.product,this.selectedImages).then(()=>{
          this.ngxService.stop();
          this.toastr.success("Product added successfuly")
        }).catch(e=>{
          this.ngxService.stop();
          this.toastr.success("Failed to added product");
          console.log(e);
        })
    }else{
      this.ngxService.start();
      this.productService.updateProductDetails(this.product,this.selectedImages,this.oldImages).then(()=>{
        this.ngxService.stop();
        this.toastr.success("Product updated successfuly")
      }).catch(e=>{
        this.ngxService.stop();
        this.toastr.success("Failed to updated product");
        console.log(e);
      })
    }

  }
  getAvailableSizes(availableSizes: Array<Size>){
    let sizes = availableSizes.filter(s=>s.count>0).map(s=>s.size);
    let newSize : Array<string> = [];
      if(sizes.indexOf('S') != -1){
        newSize.push('S');
      }
      if(sizes.indexOf('M') != -1){
        newSize.push('M');
      }
      if(sizes.indexOf('L') != -1){
        newSize.push('L');
      }
      if(sizes.indexOf('XL') != -1){
        newSize.push('XL');
      }
      if(sizes.indexOf('XXL') != -1){
        newSize.push('XXL');
      }
      if(sizes.indexOf('XXXL') != -1){
        newSize.push('XXXL');
      }
    return newSize.toString();
  }
  getProdcutCountForSize(size:string){
    if(this.product.availableSizes.find(s=>s.size==size)){
      return this.product.availableSizes.find(s=>s.size==size).count;
    }
    return 0;
  }

  saveName(){
    this.product.name = this.editedName;
    this.nameEdit = false;
  }
  cancelName(){
    this.nameEdit = false;
  }
  saveDetails(){
    this.product.details = this.editedDetails;
    this.detailsEdit = false;
  }
  cancelDetails(){
    this.detailsEdit = false;
  }
  saveAmount(){
    this.product.discountPrice = parseInt(this.editedDiscountedAmount+"");
    this.product.discount = parseInt(this.editedDiscount+"");
    this.amountEdit = false;
  }
  cancelAmount(){
    this.amountEdit = false;
  }
  addMoreOnSize(size){
    const modalRef = this.modalService.open(SelectSizeComponent);
    modalRef.componentInstance.maxCount = 100;
    modalRef.result.then(result=>{
      if(result){
        let s = this.product.availableSizes.find(c=>c.size == size);
        if(s){
          s.count = result;
        }else{
          this.product.availableSizes.push({
            size : size,
            count : result
          });
        }
      }
    }).catch(e=>{

    });
  }
  onSelectFile(event,index){
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      this.selectedImages[index] = event.target.files[0];
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.oldImages[index] = this.product.images[index];
        this.product.images[index] = event.target.result as string;
      }
    }
  }

  removeCategory(catId){
    this.ngxService.start();
    this.productService.unlinkProduct(this.product.id,catId).then(()=>{
      this.linkedCategoriesNameMap.delete(catId);
      this.ngxService.stop();
    }).catch(e=>{
      this.ngxService.stop();
    })
  }

  addNewCategoryToProduct(){
    let catId;
    if(this.selectedSubCat){
      catId = this.selectedSubCat.id;
    }else if(this.selectedCat){
      catId = this.selectedCat.id;
    }
    if(catId){
      this.ngxService.start();
      this.productService.linkProduct(this.product.id,catId).then(()=>{
        this.product.category.push(catId);
        this.linkedCategoriesNameMap = this.getLinkedCategoriesName();
        this.selectedSubCat = undefined;
        this.selectedCat = undefined;
        this.ngxService.stop();
      }).catch(e=>{
        this.ngxService.stop();
      })
    }
  }

  selectMainCat(mainCat : MainCategory){
    this.selectedMainCat = mainCat;
    this.selectedCat = undefined;
    this.selectedSubCat = undefined;
  }
  selectedCategory(cat : Category){
    this.selectedCat=cat;
    this.selectedSubCat = undefined;
  }

  selectedSubCategory(subCategory: SubCategory){
    this.selectedSubCat = subCategory;
  }
}
