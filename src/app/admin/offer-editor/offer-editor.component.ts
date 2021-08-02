import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { OfferService } from 'src/app/services/offer.service';
import { Category, MainCategory, Product, SubCategory } from 'src/bean/category';
import { HomeSubItem, MainOffer } from 'src/bean/offer';

@Component({
  selector: 'app-offer-editor',
  templateUrl: './offer-editor.component.html',
  styleUrls: ['./offer-editor.component.scss']
})
export class OfferEditorComponent implements OnInit {

  offerType : string;
  offerId : string;
  subOfferId : string;
  linkedProducts : Array<Product> = [];
  products : Array<Product> = [];
  subOffer : HomeSubItem|MainOffer;
  mainCategoryList : Array<MainCategory>;
  selectedMainCat : MainCategory;
  selectedCat : Category;
  selectedSubCat : SubCategory;
  selectedImage: any;
  oldImage: string;

  constructor(private route: ActivatedRoute,
    private categoryService : CategoryService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private offerService: OfferService) { 
      this.route.queryParams.subscribe(params => {
        window.scroll(0,0);
        this.offerId = params.offerId;
        this.offerType = params.offerType;
        this.subOfferId = params.subOfferId;
        if(this.offerType == 'sub'){
          if(this.subOfferId){
            this.offerService.getHomeSubOfferById(this.offerId,this.subOfferId).then(res=>{
              this.subOffer = res.data() as HomeSubItem;
            })
            this.getLinkedProductList(this.subOfferId);
          }else{
            this.subOffer = {
              hide:false,
              id:"dummy",
              image : "../../assets/logo.png",
              order : 0
            }
          }
        }else{
          if(this.offerId){
            this.offerService.getHomeMainOfferById(this.offerId).then(res=>{
              this.subOffer = res.data() as HomeSubItem;
            })
            this.getLinkedProductList(this.offerId);
          }else{
            this.subOffer = {
              hide:false,
              id:"dummy",
              image : "../../assets/logo.png",
              order : 0
            }
          }
        }
        
      });
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

  getLinkedProductList(id:string){
    this.categoryService.getProductList(id,"discount",'desc').then(res => {
      this.linkedProducts = res.docs.map(d=>{
        let p = d.data() as Product;
        p.id = d.id;
        return p;
      })
      if(this.products && this.products.length){
        this.products = this.products.filter(p=>this.linkedProducts==undefined || this.linkedProducts.findIndex(lp=>lp.id==p.id)==-1);
      }
    })
  }

  onSelectFile(event){
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.oldImage = this.subOffer.image;
        this.subOffer.image = event.target.result as string;
      }

      this.selectedImage = event.target.files[0];
    }
  }

  unlinkProduct(productId : string){
    this.categoryService.unlinkProduct(productId,this.subOfferId).then(res=>{
      this.getLinkedProductList(this.offerType=='sub'?this.subOfferId:this.offerId);
      this.toastr.success("Product unlinked successfully")
    })
    event.stopPropagation();
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
      if(this.products && this.products.length){
        this.products = this.products.filter(p=>this.linkedProducts==undefined || this.linkedProducts.findIndex(lp=>lp.id==p.id)==-1);
      }
      this.ngxService.stop()
    }).catch(e=>{
      this.ngxService.stop()
    })
  }
  selectedSubCategory(subCat : SubCategory){
    this.selectedSubCat = subCat;
    this.getProducts(subCat.id);
  }

  linkSelectedProducts(){
    let pList : Array<Promise<any>> = [];
    this.products.filter(p=>p.isWishList).forEach(p=>{
      pList.push(this.categoryService.linkProduct(p.id,this.offerType=='sub'?this.subOfferId:this.offerId));
    });
    this.ngxService.start()
    Promise.all(pList).then(()=>{
      this.ngxService.stop();
      this.products = this.products.filter(p=>!p.isWishList);
      this.getLinkedProductList(this.offerType=='sub'?this.subOfferId:this.offerId);
      this.toastr.success("Products linked successfully")

    }).catch(e=>{
      this.ngxService.stop()
    })
  }

  updateSubOferOrderAndImage(subOffer : HomeSubItem){
    if(subOffer.id == 'dummy'){
      if(this.selectedImage){
        this.ngxService.start()
        if(this.offerType=='sub'){
          this.offerService.addSubOffer(this.offerId,subOffer).then(doc=>{
            this.subOffer.id = doc.id;
            this.subOfferId = doc.id;
            this.offerService.uploadSubOfferImage(this.offerId,this.subOffer.id,this.selectedImage).then(res=>{
              this.ngxService.stop();
           }).catch(e=>{
            this.subOffer.image = this.oldImage;
            this.ngxService.stop();
           });
           }).catch(e=>{
            this.ngxService.stop();
           })
        }else{
          this.offerService.addMainOffer(subOffer).then(doc=>{
            this.subOffer.id = doc.id;
            this.offerId = doc.id;
            this.offerService.uploadMainOfferImage(this.subOffer.id,this.selectedImage).then(res=>{
              this.ngxService.stop();
           }).catch(e=>{
            this.subOffer.image = this.oldImage;
            this.ngxService.stop();
           });
           }).catch(e=>{
            this.ngxService.stop();
           })
        }
        
      }else{
        this.toastr.warning("Please select one image for offer");
      }
      
    }else{
      if(this.offerType=='sub'){
        if(this.selectedImage){
          this.offerService.uploadSubOfferImage(this.offerId,this.subOffer.id,this.selectedImage);
        }
        this.offerService.updateSubOfferOrder(this.offerId,subOffer).then(()=>{
          this.ngxService.stop();
        }).catch(e=>{
          this.ngxService.stop();
        })
      }else{
        if(this.selectedImage){
          this.offerService.uploadMainOfferImage(this.offerId,this.selectedImage);
        }
        this.offerService.updateMainOfferOrder(this.offerId,subOffer).then(()=>{
          this.ngxService.stop();
        }).catch(e=>{
          this.ngxService.stop();
        })
      }
      
    }
    
  }

}
