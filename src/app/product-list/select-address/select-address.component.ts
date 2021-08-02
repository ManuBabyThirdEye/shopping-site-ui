import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmBoxComponent } from 'src/app/app-modal/confirm-box/confirm-box.component';
import { CategoryService } from 'src/app/services/category.service';
import { LocalStoreObjectService } from 'src/app/services/local-store-object.service';
import { Address, Order, PinCode } from 'src/bean/category';
import { AddAddressComponent } from '../../app-modal/add-address/add-address.component';

@Component({
  selector: 'app-select-address',
  templateUrl: './select-address.component.html',
  styleUrls: ['./select-address.component.scss']
})
export class SelectAddressComponent implements OnInit {

  addressList : Array<Address> = [];
  selectedAddress : Address;
  cart: Order;
  pinStatus : PinCode;

  constructor(private categoryService : CategoryService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private localStoreObjectService: LocalStoreObjectService,
    private router: Router) { 
      window.scroll(0,0);
      this.cart = localStoreObjectService.getObject("order");
      this.pinStatus = this.localStoreObjectService.getObject("pincode");
    }

  ngOnInit(): void {

    this.ngxService.start();
    this.categoryService.getAddressListFromUser().subscribe(addresses=>{
      addresses.map(adrs => {
        let address :Address  = adrs.payload.doc.data() as Address;
        address.id = adrs.payload.doc.id;
        if(adrs.type == 'added'){
          this.addressList.push(address);
        } else if(adrs.type == 'modified'){
          let index = this.addressList.findIndex(a=>a.id==address.id);
          if(index!=-1){
            this.addressList[index] = address;
          }
        } else if(adrs.type == "removed"){
          let index = this.addressList.findIndex(a=>a.id==address.id);
          if(index!=-1){
            this.addressList.splice(index,1);
          }
        }
        return address;
      })
      if(this.addressList.length>0){
        this.addressList[0].selected = true;
        this.selectedAddress = this.addressList[0];
      }
      this.ngxService.stop();
    })
  }

  confirmOrder(){
    if(this.selectedAddress){
      if(this.pinStatus.pinCodeDeliveryDelay && this.cart.cartProducts){
        this.cart.cartProducts.forEach(prod => {
          let totalDelay : number = prod.product.productDeliveryDelay + this.pinStatus.pinCodeDeliveryDelay;
          let today = new Date();
          today.setDate(today.getDate()+totalDelay);
          prod.delivertDate = today.toISOString();
        })
      }
      this.cart.address = this.selectedAddress;
      this.cart.currentOrderStatus="PLACED";
      this.cart.orderStatusList = [
        {
          orderStatus : "PLACED",
          date : new Date().toISOString()
        }
      ]
      this.cart.placedDate = new Date().toISOString();
      this.localStoreObjectService.setObject("order",this.cart);
      this.ngxService.start();
      this.categoryService.reduceProductCountAndPlaceOrder(this.cart).then(resp=>{
        this.toastr.success("Your order placed");
        this.localStoreObjectService.removeObject("order");
        this.categoryService.evictCartList();
        this.router.navigate(['/order-details'],{queryParams : {orderId:resp.id,order:true}});
        this.ngxService.stop();
      }).catch(e=>{
        this.router.navigate(['/cart']);
      })
    }else{
      this.toastr.warning("Select your address first");
    }
  }

  addAddress(){
    const modalRef = this.modalService.open(AddAddressComponent);   
    modalRef.result.then(result=>{
      if(result){
        this.ngxService.start();
        this.categoryService.addAddress(result).then(()=>{
          this.ngxService.stop();
        })
      }
    }).catch(e=>{
      
    })
  }

  deleteAddress(addressId : string){
    const confirmDeleteAddress = this.modalService.open(ConfirmBoxComponent);
    confirmDeleteAddress.componentInstance.image = "../../assets/placeholder.png";
    confirmDeleteAddress.componentInstance.heading = "Remove";
    confirmDeleteAddress.componentInstance.details = "Are you sure you want to remove this address?";
    confirmDeleteAddress.componentInstance.positiveText = "REMOVE";
    confirmDeleteAddress.componentInstance.negativeText = "CANCEL";

    confirmDeleteAddress.result.then(result=>{
      if(result){
        this.ngxService.start();
        this.categoryService.removeAddress(addressId).then(()=>{
          this.ngxService.stop();
        })
      }
    }).catch(e=>{
      
    })
    event.stopPropagation();
  }

  editAddress(address : Address){
    const modalRef = this.modalService.open(AddAddressComponent);    
    modalRef.componentInstance.address = address;

    modalRef.result.then(result=>{
      if(result){
        result.id = address.id;
        this.ngxService.start();
        this.categoryService.editAddress(result).then(()=>{
          this.ngxService.stop();
        })
      }
    }).catch(e=>{
      
    })
  }

  selectAddress(addressId : string){
    this.addressList.map(a => {
      if(a.id == addressId){
        a.selected = true;
        this.selectedAddress = a;
        if(this.pinStatus){
          if(this.pinStatus.pincode != a.pinCode){
            this.categoryService.getPincodeAvailable(a.pinCode).then(doc => {
              if(doc.exists){
                this.toastr.warning("You selected new pin code, this may change the delivery date");
                this.pinStatus = doc.data() as PinCode;
                this.pinStatus.pincode = doc.id;
              }else{
                this.toastr.error("Currently we won't deliver the product on selected address")
              }
            });
          }
        }else{
          this.categoryService.getPincodeAvailable(a.pinCode).then(doc => {
            if(doc.exists){
              this.toastr.warning("Pin code added now, this may change the delivery date");
              this.pinStatus = doc.data() as PinCode;
              this.pinStatus.pincode = doc.id;
            }else{
              this.toastr.error("Currently we won't deliver the product on selected address")
            }
          });
        }
      }else{
        a.selected = false;
      }
      return a;
    } );
  }

}