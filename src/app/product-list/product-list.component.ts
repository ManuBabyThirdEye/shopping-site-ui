import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Filter, Product, WishItem } from 'src/bean/category';
import { environment } from 'src/environments/environment';
import { KeyValue } from '../../bean/common';
import { CategoryService } from '../services/category.service';
import { LocalStoreObjectService } from '../services/local-store-object.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit,AfterViewInit {

  @ViewChild("filterBox") filterBox: ElementRef;
  @ViewChild("productListBox") productListBox: ElementRef;

  @ViewChild('scrollframe') scrollFrame: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;

  mainCategory : string;
  category : string;
  categoryId : string;
  subCategory : string;
  subCategoryId : string;
  selectSort : KeyValue;
  sortList : Array<KeyValue> = [];
  filterList : Array<Filter>;
  productList : Array<Product> = undefined;
  showSortListMobile : boolean = false;
  mobileNumber : string;
  icon : string;

  private scrollContainer: any;
  constructor(
    private route: ActivatedRoute,
    private categoryService : CategoryService,
    private productService : ProductService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private local : LocalStoreObjectService) { 
      this.icon = "../../"+environment.icon;
    this.route.queryParams.subscribe(params => {
      window.scroll(0,0);
      this.mainCategory = params.mainCategory;
      this.category = params.category;
      this.subCategory = params.subCategory;
      this.categoryId = params.categoryId;
      this.subCategoryId = params.subCategoryId;
      this.filterList = [];
      this.mobileNumber = this.categoryService.getUserMobileNumber();
      console.log(this.mobileNumber);
      this.categoryService.getFilter(this.subCategoryId?this.subCategoryId:this.categoryId).then(f=>{
        if(f.get("active")){
          this.filterList= f.get("filters");
          setTimeout(()=>{ 
            if(this.productListBox)
              this.scrollContainer = this.productListBox?this.productListBox.nativeElement:undefined;  
            console.log(this.scrollContainer);
            if(this.productListBox)
              this.productListBox.nativeElement.style.maxHeight = this.filterBox.nativeElement.offsetHeight+"px"; }, 1000)
        }
      });
      this.updateProductList("discount",'desc');
    });

    this.sortList = [
      {
        key: "-discount",
        value: "Better Discount"
      },
      {
        key: "-rating",
        value: "Top Rated"
      },
      
      {
        key: "+discountPrice",
        value: "Price : Low to High"
      },
      {
        key: "-discountPrice",
        value: "Price : High to Low"
      }
    ]
    this.selectSort = this.sortList[0];
  }
  updateProductList(field: string, sortOption: string) {
    this.ngxService.start();
      this.productService.getProductList(this.subCategoryId?this.subCategoryId:this.categoryId,field,sortOption).then(p=>{
        this.productList = [];
        p.docs.map(pro =>{
          let p = pro.data() as Product;
          p.id = pro.id;
          this.productList.push(p);
        })
        if(this.local.getObject(LocalStoreObjectService.USER_KEY)){
          this.categoryService.getWishList().then(wishList=>{
            let wishproducts = wishList.docs.map(doc => {
              let item = doc.data() as WishItem;
              item.id = doc.id;
              return item;
            });
            this.productList = this.productList.map(p=>{
              if(wishproducts.find(w=>w.id==p.id)){
                p.isWishList = true;
              }
              return p;
            })
          })
        }
        setTimeout(()=>{ 
          this.scrollContainer = this.scrollFrame?this.scrollFrame.nativeElement:undefined;  
        });
        this.ngxService.stop();
      })
  }

  updateProductWithSort(sort : KeyValue){
    this.selectSort = sort;
    this.updateProductList(sort.key.substring(1,sort.key.length),sort.key.substring(0,1)=="-"?'desc':'asc')
  }

  ngOnInit(): void {

    
    
  }

  getAvgRating(product : Product){
    return product.reviews == undefined || product.reviews.length==0?0:product.reviews.map(p=>p.rating).reduce((r1,r2)=>r1+r2)/product.reviews.length;
  }

  addToWhichList(product: Product, select:boolean){
    if(select){
      this.categoryService.addToWishList(product).then(()=>{
        this.toastr.success("Product added to your wishlist");
      });
    }else{
      this.categoryService.removeFromWishList(product.id).then(()=>{
        this.toastr.success("Product removed from your wishlist");
      });
    }
    this.productList.find(p=>p.id==product.id).isWishList = select;
  }

  ngAfterViewInit() {
    
  }
  @HostListener('window:scroll', [])  
  onWindowScroll() {
    console.log(this.isUserNearBottom());
    if(this.isUserNearBottom()){
      //TODO get more products 
    }
  }

  private isUserNearBottom(): boolean {
    const threshold = 1600;
    const position = document.documentElement.offsetHeight - document.documentElement.scrollTop;
    return position < threshold;
  }

}
