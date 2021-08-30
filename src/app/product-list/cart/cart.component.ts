import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmBoxComponent } from 'src/app/app-modal/confirm-box/confirm-box.component';
import { SelectSizeComponent } from 'src/app/app-modal/select-size/select-size.component';
import { CategoryService } from 'src/app/services/category.service';
import { LocalStoreObjectService } from 'src/app/services/local-store-object.service';
import { ProductService } from 'src/app/services/product.service';
import { Order, CartProduct, PinCode, Product, User } from 'src/bean/category';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  cart : Order;
  pincode:string = "";
  offerList : Array<String> = [];
  showingMore : boolean = false;
  pinStatus: PinCode;
  pinCode : string;
  constructor(private categoryService : CategoryService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private localStoreObject: LocalStoreObjectService,
    private router: Router,
    private modalService: NgbModal) { 
      window.scroll(0,0);
    this.cart = {
      id:undefined,
      address : undefined,
      cartProducts : [],
      total : 0,
      totalMRP : 0,
      convenienceFee : 0,
      currentOrderStatus : "",
      orderStatusList : [],
      mobileNumber : "",
      includeConvenienceFee : true,
      placedDate:undefined,
      paymentMode : undefined,
      paymentDetails : undefined
    }

    this.pinStatus = this.localStoreObject.getObject("pincode");
    if(this.pinStatus){
      this.pincode = this.pinStatus.pincode;
      this.cart.convenienceFee = this.pinStatus.convenienceFee;
    }
    
  }

  ngOnInit(): void {

    this.offerList = [
    ]
    this.ngxService.start();
    this.categoryService.getProductListForCart().then(cartList => {
        cartList.forEach(cartPromise => {
          cartPromise.then(cartItem => {
            let currentAvailableSize = cartItem.product.availableSizes.find(s=>s.size==cartItem.size);
            if(!currentAvailableSize ||currentAvailableSize.count<=0){
              const confirmRemoveCart = this.modalService.open(ConfirmBoxComponent);
              confirmRemoveCart.componentInstance.image = cartItem.product.images[0];
              confirmRemoveCart.componentInstance.heading = "Missed It!";
              confirmRemoveCart.componentInstance.details = "Sorry you missed this product, Selected size is not availabel now";
              confirmRemoveCart.componentInstance.positiveText = "CANCEL";
              confirmRemoveCart.componentInstance.negativeText = "MOVE TO WISHLIST";

              confirmRemoveCart.result.then(result=>{
                if(!result){
                  this.moveToWishList(cartItem);
                }else{
                  this.categoryService.removeFromCart(cartItem.cartId);
                }
              }).catch(e=>{
                
              })
            }else{
              let totalDelay : number = (cartItem.product.productDeliveryDelay?cartItem.product.productDeliveryDelay:0) + (this.pinStatus && this.pinStatus.pinCodeDeliveryDelay?this.pinStatus.pinCodeDeliveryDelay:0);
              let today = new Date();
              today.setDate(today.getDate()+totalDelay);
              cartItem.delivertDate = today.toISOString();
              this.cart.cartProducts.push(cartItem);
              this.cart.total = this.cart.total + cartItem.product.discountPrice * cartItem.quantity;
              this.cart.totalMRP = this.cart.totalMRP + (cartItem.product.discountPrice * 100 )/(100-cartItem.product.discount) * cartItem.quantity;
              if(this.pinStatus && this.pinStatus.minOrderAmount>this.cart.total){
                this.cart.includeConvenienceFee = true;
              }else if(this.pinStatus){
                this.cart.includeConvenienceFee = false;
              }
            }
          })
        })
        this.ngxService.stop();
    });
  }

  removeFromCart(cartProduct : CartProduct){
    const confirmRemoveCart = this.modalService.open(ConfirmBoxComponent);
    confirmRemoveCart.componentInstance.image = cartProduct.product.images[0];
    confirmRemoveCart.componentInstance.heading = "Remove Item";
    confirmRemoveCart.componentInstance.details = "Are you sure you want to remove this item?";
    confirmRemoveCart.componentInstance.positiveText = "REMOVE";
    confirmRemoveCart.componentInstance.negativeText = "MOVE TO WISHLIST";
    confirmRemoveCart.componentInstance.showClose = true;

    confirmRemoveCart.result.then(result=>{
      if(!result){
        this.moveToWishList(cartProduct);
      }
      this.ngxService.start();
        this.categoryService.removeFromCart(cartProduct.cartId).then(()=>{
          this.toastr.success("Product removed from cart");
          let index = this.cart.cartProducts.findIndex(p=>p.cartId == cartProduct.cartId);
          if(index != -1){
            this.cart.cartProducts.splice(index,1);
          }
          this.updateTotal();
          this.ngxService.stop();
        })
    }).catch(e=>{
      
    })
    
  }

  moveToWishList(cartProduct : CartProduct){
    this.ngxService.start();
    this.categoryService.addToWishList(cartProduct.product).then(()=>{
      this.categoryService.removeFromCart(cartProduct.cartId).then(()=>{
        this.toastr.success("Product moved to wishlist");
        let index = this.cart.cartProducts.findIndex(p=>p.cartId == cartProduct.cartId);
        if(index != -1){
          this.cart.cartProducts.splice(index,1);
        }
        this.updateTotal();
        this.ngxService.stop();
      })
    });
  }

  updateTotal(){
    this.cart.total = 0;
    this.cart.totalMRP = 0;
    if(this.cart.cartProducts && this.cart.cartProducts.length >0){
      this.cart.cartProducts.forEach(cartItem => {
        this.cart.total = this.cart.total + cartItem.product.discountPrice * cartItem.quantity;
        this.cart.totalMRP = this.cart.totalMRP + (cartItem.product.discountPrice * 100 )/(100-cartItem.product.discount) * cartItem.quantity;
      })
      if(this.pinStatus && this.pinStatus.minOrderAmount>this.cart.total){
        this.cart.includeConvenienceFee = true;
      }else if(this.pinStatus){
        this.cart.includeConvenienceFee = false;
      }
    }
    
  }

  goToAddressSelection(){
    let user : User = this.localStoreObject.getObject(LocalStoreObjectService.USER_KEY);    
    this.cart.mobileNumber = user.mobileNumber;
    this.localStoreObject.setObject("order",this.cart);
    this.router.navigate(['/select-address']);
  }

  checkPin(){
    if(this.pinStatus && this.pinStatus.available){
      this.pinStatus = undefined;
    }else{
      this.categoryService.getPincodeAvailable(this.pinCode).then(doc=>{
        console.log(doc.exists);
        if(doc.exists){
          this.pinStatus = doc.data() as PinCode; 
          this.pinStatus.pincode = doc.id;
          if(this.pinStatus.pinCodeDeliveryDelay && this.cart.cartProducts){
            this.cart.cartProducts.forEach(prod => {
              let totalDelay : number = prod.product.productDeliveryDelay + this.pinStatus.pinCodeDeliveryDelay;
              let today = new Date();
              today.setDate(today.getDate()+totalDelay);
              prod.delivertDate = today.toISOString();
            })
          }
          if(this.pinStatus.available){
            this.localStoreObject.setObject("pincode",this.pinStatus);
          }
        }else{
          this.localStoreObject.removeObject("pincode");
          this.pinStatus = {
            pincode:"",
            available : false,
            codAvailable : false,
            pinCodeDeliveryDelay : 0,
            returnAvailable : false,
            convenienceFee : 0,
            minOrderAmount : 0,
            district : "",
            state : ""
          };
        }
        console.log(this.pinStatus);

      }).catch(e=>{
        this.localStoreObject.removeObject("pincode");
          this.pinStatus = {
            pincode:"",
            available : false,
            codAvailable : false,
            pinCodeDeliveryDelay : 0,
            returnAvailable : false,
            convenienceFee : 0,
            minOrderAmount : 0,
            district : "",
            state : ""
          };
      });
    }
    
  }

  selectSize(cartItem : CartProduct){
    const modalRef = this.modalService.open(SelectSizeComponent);
    console.log(cartItem);
    modalRef.componentInstance.maxCount = cartItem.product.availableSizes.find(s=>s.size==cartItem.size).count;
    modalRef.result.then(result=>{
      if(result){
        this.cart.cartProducts.find(c=>c.cartId == cartItem.cartId).quantity = result;
        this.updateTotal();
        this.categoryService.updateProductQuantity(cartItem.cartId,result);
      }
    }).catch(e=>{

    });
  }

}
