import { Component, HostListener, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { LocaldbService } from 'src/app/services/localdb.service';

import { CartProduct, KEY_CODE, Order, PaymentMode, Product, Size } from 'src/bean/category';
import { ConfirmBoxComponent } from 'src/app/app-modal/confirm-box/confirm-box.component';
import { PrintComponent } from 'src/app/app-modal/print/print.component';
import { Router } from '@angular/router';
import { ProductDatailsComponent } from 'src/app/app-modal/product-datails/product-datails.component';
import * as XLSX from 'xlsx';
import { Address } from 'cluster';
import { AnyARecord } from 'dns';
import { DocumentReference } from '@angular/fire/firestore';
import { SelectQuantityComponent } from 'src/app/app-modal/select-quantity/select-quantity.component';
import { SelectSizeComponent } from 'src/app/app-modal/select-size/select-size.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {

  productDetail : string = "";

  addedProducts : Array<CartProduct> = [];

  selectedProdList : Array<Product> = [];

  total : number;

  totalMRP : number;

  timer : any;

  PRODUCT_PAGINATION_LIMIT = 20; 

  SIZE_MAPPER = new Map();
  progress :number = 0;
  inPersonDiscount : number=0;
  openInPersonDiscount : boolean = false;
  isPopupOpen : boolean = false;
  arrayBuffer:any;
  file:File;
  progressBk:string="var(--theme-color)";

  ITEM_NO :string = "ITEM NO";
  ITEM_NAME : string ="ITEM NAME";
  DESCRIPTION : string = "DESCRIPTION";
  DISCOUNT_AMOUNT : string = "DISCOUNT AMOUNT";
  DISCOUNT : string ="DISCOUNT";
  icon : string;
  constructor(private categoryService : CategoryService,
    private productService : ProductService,
    private localdbService : LocaldbService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private router: Router) { 

      this.SIZE_MAPPER.set("00","FREE SIZE");
      this.SIZE_MAPPER.set("01","S");
      this.SIZE_MAPPER.set("02","M");
      this.SIZE_MAPPER.set("03","L");
      this.SIZE_MAPPER.set("04","XL");
      this.SIZE_MAPPER.set("05","XXL");
      this.SIZE_MAPPER.set("06","XXXL");

      this.icon = "../../../"+environment.icon;

      this.localdbService.getAllProductFormLocal().then(products=>{
        if(products.length==0){
          const confirmreturn = this.modalService.open(ConfirmBoxComponent);
          confirmreturn.componentInstance.image = "../../assets/shopping.png";
          confirmreturn.componentInstance.heading = "No Products";
          confirmreturn.componentInstance.details = "There is no product available in your local system,this will impact the product search time. \nDo you want to synch it with remote ?";
          confirmreturn.componentInstance.positiveText = "YES";
          confirmreturn.componentInstance.negativeText = "NO";
      
          this.isPopupOpen = true;
          confirmreturn.result.then(result=>{
            if(result){
              this.downloadProduct();
            }
            this.isPopupOpen = false;
          }).catch(e=>{
            this.isPopupOpen = false;
          });
        }
      })
    }

  ngOnInit(): void {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {  
    if(!this.openInPersonDiscount && !this.isPopupOpen){
      if (event.keyCode === KEY_CODE.ENTER) {
        if(this.productDetail && this.productDetail.length>3){
          this.getProductDetails();
        }else{
          this.productDetail = "";
          this.toastr.error("Wrong product id, Enter minimum 3 digit product id")
        }
      }else{
        if((event.keyCode >= KEY_CODE.ZERO && event.keyCode <= KEY_CODE.NINE) || event.keyCode == KEY_CODE.BACK){
          if(event.keyCode == KEY_CODE.BACK){
            this.productDetail = this.productDetail.substring(0,this.productDetail.length-1);
          }else{
            this.productDetail = this.productDetail+event.key.toUpperCase();
          }
        }
      }  
    }
        
  }

  searchProduct(event){
    if(event.key == 'Enter'){
      if(this.productDetail && this.productDetail.length>3){
        this.getProductDetails();
      }else{
        this.productDetail = "";
        this.toastr.error("Wrong product id, Enter minimum 3 digit product id")
      }
    }
  }
  async getProductDetails() {
      this.selectedProdList = [];
      let productId = parseInt(this.productDetail.substring(2,this.productDetail.length));
      let productSize = this.SIZE_MAPPER.get(this.productDetail.substring(0,2));
      this.productDetail = "";
      let product : Product = await this.localdbService.getProductById(productId+"");
      if(!product){
        this.ngxService.start();
        product = await this.productService.getProductById(productId+"");
        this.ngxService.stop();
        if(product){
          this.localdbService.addNewProduct(product);
          this.selectedProdList.push(product);
          this.addProductToBilling(product,productSize);
        }else{
          const confirmreturn = this.modalService.open(ConfirmBoxComponent);
          confirmreturn.componentInstance.image = "../../assets/shopping.png";
          confirmreturn.componentInstance.heading = "No Product";
          confirmreturn.componentInstance.details = "There is no product available for this "+productId;
          confirmreturn.componentInstance.positiveText = "OK";
          confirmreturn.componentInstance.negativeText = "ADD MANUALY";
      
          this.isPopupOpen = true;
          confirmreturn.result.then(result=>{
            if(!result){
              const productBox = this.modalService.open(ProductDatailsComponent);
              productBox.componentInstance.size = productSize;
              this.isPopupOpen = true;
              productBox.result.then(result=>{
                if(result){
                  let newProduct  = result as Product;
                  newProduct.availableSizes = [{
                    size :productSize,
                    count : 1
                  }];
                  newProduct.id= productId+"";
                  this.localdbService.addNewProduct(newProduct);
                  this.addProductToBilling(newProduct,productSize);
                }
                this.isPopupOpen = false;
              }).catch(e=>{
                this.isPopupOpen = false;
              });
            }else{
              this.isPopupOpen = false;
            }
          }).catch(e=>{
            this.isPopupOpen = false;
          });
        }
      }else{
        this.selectedProdList.push(product);
        this.addProductToBilling(product,productSize);
      }
  }
  addProductToBilling(product: Product, size : string) {
    let selectedSize = product.availableSizes.find(s=>s.size==size);
    if(selectedSize && selectedSize.count>0){
      this.addProductToBillingList(product,selectedSize);
      this.updateTotalPrice();
    }else{
      const confirmreturn = this.modalService.open(ConfirmBoxComponent);
          confirmreturn.componentInstance.image = "../../assets/shopping.png";
          confirmreturn.componentInstance.heading = "No Product Size";
          confirmreturn.componentInstance.details = "Product size is not available, Do you want to countinue with 1 Quantity";
          confirmreturn.componentInstance.positiveText = "YES";
          confirmreturn.componentInstance.negativeText = "CANCEL";
      
          this.isPopupOpen = true;
          confirmreturn.result.then(result=>{
            if(result){
              if(!selectedSize){
                selectedSize = {size: size,count:1};
              }
              selectedSize.count = 1;
              this.addProductToBillingList(product,selectedSize);
              this.updateTotalPrice();
              this.isPopupOpen = false;
            }
          }).catch(e=>{
            this.isPopupOpen = false;
          }); 
    }
    
  }
  addProductToBillingList(product: Product, selectedSize: Size) {
    if(selectedSize){
      let index = this.addedProducts.findIndex(p=>p.product.id==product.id && p.size == selectedSize.size);
      if(index != -1){
        this.addedProducts[index].quantity = this.addedProducts[index].quantity + 1;
      }else{
        this.addedProducts.push({
          cartId : new Date().getMilliseconds()+"",
          delivertDate : new Date().toISOString(),
          product : product,
          quantity : 1,
          size : selectedSize.size,
          productRef : {} as DocumentReference
        });
      }
    }
  }
  updateTotalPrice() {
    if(!this.inPersonDiscount){
      this.inPersonDiscount = 0;
    }
    this.inPersonDiscount = parseInt(this.inPersonDiscount+"");
    this.total = 0;
    this.totalMRP = 0;
    this.addedProducts.forEach(prod=>{
      this.total = this.total + prod.quantity*prod.product.discountPrice;
      this.totalMRP = this.totalMRP + (prod.product.discountPrice * 100 )/(100-prod.product.discount) * prod.quantity;
    });
    this.total -= this.inPersonDiscount;
  }

  async downloadProduct(){
    let count = await this.productService.getProductCount();
    if(count>0){
      let lastRecord = undefined;
      this.progress = 10;
      this.progressBk="var(--theme-color)";
      let downloadbtn = document.getElementById("download");
      downloadbtn.innerHTML = this.progress+"%"
      for(let i=0;i<=count/this.PRODUCT_PAGINATION_LIMIT;i++){
        let products = await this.productService.getAllProductWithPagination(lastRecord,this.PRODUCT_PAGINATION_LIMIT);
        this.localdbService.updateLocalProducts(products);
        this.progress =  (100*(i+1))/(count/this.PRODUCT_PAGINATION_LIMIT);
        downloadbtn.innerHTML = this.progress.toFixed(0)+"%"
        if(products.length==0 || products.length<this.PRODUCT_PAGINATION_LIMIT){
          this.progress = 0;
          downloadbtn.innerHTML = "DOWNLOAD"
          return;
        }
        lastRecord = await this.productService.getDocSnapshotOfProduct(products[products.length-1].id);
        
      }
    }
  }

  uploadProduct(){
    this.localdbService.getAllProductFormLocal().then(p=>{
      console.log(p);
    })
  }

  billing(){
    var orderId = Math.floor( Date.now()/1000 );

    const confirmreturn = this.modalService.open(ConfirmBoxComponent);
    confirmreturn.componentInstance.image = "../../assets/shopping.png";
    confirmreturn.componentInstance.heading = "Billing";
    confirmreturn.componentInstance.details = "Are you sure you want to continue billing";
    confirmreturn.componentInstance.positiveText = "YES";
    confirmreturn.componentInstance.negativeText = "CANCEL";
      
    this.isPopupOpen = true;
    confirmreturn.result.then(result=>{
      if(result){
        const confirmreturn = this.modalService.open(PrintComponent);
        confirmreturn.componentInstance.billNumber = orderId;
        confirmreturn.componentInstance.addedProducts = this.addedProducts;
        this.isPopupOpen = true;
        confirmreturn.result.then(result=>{
          if(result){
               
          }
          this.isPopupOpen = false;
        }).catch(e=>{
          this.isPopupOpen = false;
        });
      
      
        let cart : Order = {
        cartProducts : this.addedProducts,
        totalMRP : this.totalMRP,
        total : this.total,
        convenienceFee : 0,
        currentOrderStatus : "SHOP",
        includeConvenienceFee : false,
        mobileNumber : "",
        orderStatusList : [],
        paymentMode : PaymentMode.SHOP_CASH,
        placedDate : new Date().toISOString(),
        id :  orderId+"",
        inPersonDiscount : this.inPersonDiscount,
        address : {
          address : "SHOP",
          district : "TVM",
          id : "",
          mobileNumber : "",
          name : "Vihar",
          pinCode : "",
          selected : false,
          state : "Kerala",
          town : ""
        },
        paymentDetails : {
          apiVersion :0,
          apiVersionMinor : 0,
          paymentMethodData : {
            description : "",
            info : {
              cardDetails : "",
              cardNetwork:""
            },
            tokenizationData : {
              token : "",
              type : ""
            }
          }
        }
        
      }

      this.localdbService.reduceProductCountAndPlaceOrder({...cart,remoteSuccess:false});
      this.productService.reduceProductCountAndPlaceOrder(cart,false).then(res=>{
        if(res){
          this.localdbService.updateBillingSuccess(cart.id);
        }else{
          console.log("failed remote upload, do this later...")
        }
      }).catch(e=>{
        console.log("failed remote upload, do this later...")
      });
      this.addedProducts = [];
    }
    this.isPopupOpen = false;
    }).catch(e=>{
      this.isPopupOpen = false;
    });
  }

  uploadBillingToRemote(){
    this.localdbService.getAllBillingFormLocal().then(billing=>{
      billing = billing.filter(b=>!b["remoteSuccess"])
      if(billing && billing.length>0){
        this.progress=1;
        let uploadBtn = document.getElementById("upload");
        uploadBtn.innerHTML = this.progress+"%"
        let inc = 100/billing.length;
        for(let bill of billing){
          if(!bill["remoteSuccess"]){
            this.productService.reduceProductCountAndPlaceOrder(bill,false).then(res=>{
              if(res){
                this.localdbService.updateBillingSuccess(bill.id);
              }
              if(this.progress !=0){
                this.progress +=inc;
                uploadBtn.innerHTML = this.progress.toFixed(0)+"%"
              }
              if(this.progress>=99){
                this.progress = 0;
                uploadBtn.innerHTML = "UPLOAD"
              }
            }).catch(e=>{
              console.log("failed remote upload, do this later...")
              this.progress = 0;
              uploadBtn.innerHTML = "UPLOAD"
            });
          }
        }
      }else{
        this.toastr.success("No bill to upload")
      }
    })
  }

  removeFromCart(cart : CartProduct){
    let index = this.addedProducts.findIndex(c=>c.size==cart.size && c.product.id==cart.product.id);
    console.log(index)
    if(index !=-1){
      this.addedProducts.splice(index,1);
    }
    this.updateTotalPrice();
  }

  addfile(event){
    let filesData = event.target.files;
    console.log(filesData[0]);
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(filesData[0]);
        fileReader.onload = (e) => {
            this.arrayBuffer = fileReader.result;
            var data = new Uint8Array(this.arrayBuffer);
            var arr = new Array();
            for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");
            var workbook = XLSX.read(bstr, {type:"binary"});
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            let newProducts : Array<Product> = this.createProductFromXcel(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
            this.uploadProductOneByOne(newProducts);
        }
        //fileReader.readAsArrayBuffer(this.file);
  }
  async uploadProductOneByOne(newProducts: Product[]) {
    this.progress = 1;
    this.progressBk="#f5bc85";
    let uploadBtn = document.getElementById("upload");
    uploadBtn.innerHTML = this.progress+"%"
    let progressIntervel = 100/newProducts.length;
    for(let newProd of newProducts){
      newProd.id = await this.productService.addNewProduct(newProd,undefined)+"";
      console.log(newProd.id);
      this.localdbService.addNewProduct(newProd);
      if(this.progress != 0){
        this.progress +=progressIntervel;
        uploadBtn.innerHTML = this.progress.toFixed(0)+"%"
      }
      if(this.progress>=100){
        this.progress = 0;
        uploadBtn.innerHTML = "UPLOAD"
      }
    }
  }
  createProductFromXcel(prodList: unknown[]): Product[] {
    
    return prodList.map(p=>{
      let prod : Product = {} as Product;
      if(p[this.ITEM_NAME]){
        prod.name = p[this.ITEM_NAME];
      }
      if(p[this.DESCRIPTION]){
        prod.details = p[this.DESCRIPTION];
      }
      if(p[this.DISCOUNT_AMOUNT]){
        prod.discountPrice = parseInt(p[this.DISCOUNT_AMOUNT]);
      }else{
        prod.discountPrice = 0;
      }
      if(p[this.DISCOUNT]){
        prod.discount = parseInt(p[this.DISCOUNT]);
      }else{
        prod.discount = 0;
      }
      if(p[this.ITEM_NO]){
        prod["location"] = p[this.ITEM_NO];
      }
      prod.availableSizes=[];
      prod.availableSizeString = "";
      if(p["S"] && p["S"]!=0){
        prod.availableSizes.push({
          size : "S",
          count : p["S"]
        })
      }
      if(p["M"] && p["M"]!=0){
        prod.availableSizes.push({
          size : "M",
          count : p["M"]
        })
      }
      if(p["L"] && p["L"]!=0){
        prod.availableSizes.push({
          size : "L",
          count : p["L"]
        })
      }
      if(p["XL"] && p["XL"]!=0){
        prod.availableSizes.push({
          size : "XL",
          count : p["XL"]
        })
      }
      if(p["XXL"] && p["XXL"]!=0){
        prod.availableSizes.push({
          size : "XXL",
          count : p["XXL"]
        })
      }
      if(p["XXXL"] && p["XXXL"]!=0){
        prod.availableSizes.push({
          size : "XXXL",
          count : p["XXXL"]
        })
      }
      if(p["FREE SIZE"] && p["FREE SIZE"]!=0){
        prod.availableSizes.push({
          size : "FREE SIZE",
          count : p["FREE SIZE"]
        })
      }
      prod.availableSizeString = prod.availableSizes.map(s=>s.size).reduce((s1,s2)=>s1+","+s2);
      return prod;
    })
  }

  selectQuantity(cartItem : CartProduct){
    const modalRef = this.modalService.open(SelectQuantityComponent);
    modalRef.componentInstance.maxCount = 10;
    this.isPopupOpen = true;
    modalRef.result.then(result=>{
      if(result){
        this.addedProducts.find(c=>c.cartId == cartItem.cartId).quantity = result;
        this.updateTotalPrice();
      }
      this.isPopupOpen = false;
    }).catch(e=>{
      this.isPopupOpen = false;
    });
  }

  selectSize(cartItem : CartProduct){
    const modalRef = this.modalService.open(SelectSizeComponent);
    this.isPopupOpen = true;
    modalRef.result.then(result=>{
      if(result){
        this.addedProducts.find(c=>c.cartId == cartItem.cartId).size = result;
        this.updateTotalPrice();
      }
      this.isPopupOpen = false;
    }).catch(e=>{
      this.isPopupOpen = false;
    });
  }

}
