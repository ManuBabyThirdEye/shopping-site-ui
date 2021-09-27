import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { LocalStoreObjectService } from 'src/app/services/local-store-object.service';
import { ProductService } from 'src/app/services/product.service';
import { PinCode, Product, User, WishItem } from 'src/bean/category';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  categoryId : string;
  subCategoryId : string;
  productId : string;

  product : Product;
  selectedSize : string;
  pinCode : string;
  deliveryStatus : PinCode = undefined;
  similarProductList : Array<Product> = [];
  delivertDate : Date;
  mobileNumber : string;

  selectedImage : string;
  productAddedToCart : boolean = false;
  user : User;
  noStock : boolean = false;

  constructor(private route: ActivatedRoute,
    private categoryService : CategoryService,
    private productService : ProductService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private localStoreObjectService: LocalStoreObjectService,
    private router: Router
    ) { 
       window.scroll(0,0);
    this.route.queryParams.subscribe(params => {
      this.categoryId = params.categoryId;
      this.subCategoryId = params.subCategoryId;
      this.productId = params.productId; 
    });

    this.similarProductList = [
    ]
    this.mobileNumber = this.categoryService.getUserMobileNumber();
    this.deliveryStatus = this.localStoreObjectService.getObject("pincode");
    if(this.deliveryStatus){
      this.pinCode = this.deliveryStatus.pincode;
    }

  }

  ngOnInit(): void {
    this.user = this.localStoreObjectService.getObject(LocalStoreObjectService.USER_KEY);
    this.ngxService.start();
    this.productService.getProduct(this.productId).then(product=>{
      console.log(product);
      this.product = product;
      this.noStock = this.chackStockAvailability(product);
      if(product){
        if(this.user && this.user.mobileNumber){
          this.categoryService.getWishList().then(wishList=>{
            let wishproducts = wishList.docs.map(doc => {
              let item = doc.data() as WishItem;
              item.id = doc.id;
              return item;
            });
            if(wishproducts.find(w=>w.id==this.product.id)){
              this.product.isWishList = true;
            }
          })
        }
      }
      if(this.deliveryStatus){
        let totalDelay : number = this.product.productDeliveryDelay + this.deliveryStatus.pinCodeDeliveryDelay;
        console.log(totalDelay);
        this.delivertDate = new Date();
        this.delivertDate.setDate(this.delivertDate.getDate()+totalDelay);
      }
      this.ngxService.stop();

    })
    if(this.subCategoryId || this.categoryId){
      this.productService.getProductList(this.subCategoryId?this.subCategoryId:this.categoryId,"rating",'desc').then(p=>{
        this.similarProductList = [];
        p.docs.map(pro =>{
          this.similarProductList.push(pro.data() as Product);
        })
      })
    }
    
  }
  chackStockAvailability(product: Product): boolean {
    let sizeAvailable = product.availableSizes.filter(s=>s.count>0).length>0;
    let subProductAvailable = product.subProductList.filter(p=>p.quantity>0).length>0;
    return !sizeAvailable && !subProductAvailable;
  }

  getClassForSize(size:string){
    if(this.selectedSize == size){
      return 'selected';
    }
    if(this.product.availableSizes.find(s=>s.size==size)){
      return 'available';
    }
    return '';
  }

  getProdcutCountForSize(size:string){
    if(this.product.availableSizes.find(s=>s.size==size) && this.product.availableSizes.find(s=>s.size==size).count<10){
      return this.product.availableSizes.find(s=>s.size==size).count;
    }
    return undefined;
  }

  selectSize(size:string){
    if(this.product.availableSizes.find(s=>s.size==size)){
      this.selectedSize = size;
      this.productAddedToCart = false;
    }
  }

  checkPinCode(){
    
    this.categoryService.getPincodeAvailable(this.pinCode).then(doc=>{
      if(doc.exists){
        this.deliveryStatus = doc.data() as PinCode; 
        this.deliveryStatus.pincode = doc.id;
        if(this.deliveryStatus.pinCodeDeliveryDelay){
          let totalDelay : number = this.product.productDeliveryDelay + this.deliveryStatus.pinCodeDeliveryDelay;
          console.log(totalDelay);
          this.delivertDate = new Date();
          
          this.delivertDate.setDate(this.delivertDate.getDate()+totalDelay);
        }
        this.localStoreObjectService.setObject("pincode",this.deliveryStatus);
      }else{
        this.localStoreObjectService.removeObject("pincode");
        this.deliveryStatus = {
          pincode:"",
          available : false,
          codAvailable : false,
          pinCodeDeliveryDelay : undefined,
          returnAvailable : false,
          convenienceFee : 0,
          minOrderAmount : 0,
          district : "",
          state : ""
        };
      }
    });
  }

  addToWishList(){
    if(!this.user && this.user.mobileNumber){
      this.router.navigate(['/login']);
    }else if(!this.product.isWishList){
      this.ngxService.start();
      this.categoryService.addToWishList(this.product).then(()=>{
        this.product.isWishList=true;
        this.ngxService.stop();
        this.toastr.success("Product added to your wishlist");
      });
    }
    
  }

  addToCart(){
    if(!this.user && this.user.mobileNumber){
      this.router.navigate(['/login']);
    }else if(this.selectedSize){
      this.ngxService.start();
      this.categoryService.addToCart(this.product, this.selectedSize,1).then(()=>{
        this.categoryService.removeFromWishList(this.product.id).then(()=>{
          this.product.isWishList = false;
          this.productAddedToCart = true;
          this.ngxService.stop();
        });
      });
    }else{
      this.toastr.error("Size not selected")
    }
  }

  informUs(){

  }

}
