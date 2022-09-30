import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmBoxComponent } from 'src/app/app-modal/confirm-box/confirm-box.component';
import { PrintComponent } from 'src/app/app-modal/print/print.component';
import { SelectQuantityComponent } from 'src/app/app-modal/select-quantity/select-quantity.component';
import { CategoryService } from 'src/app/services/category.service';
import { LocalStoreObjectService } from 'src/app/services/local-store-object.service';
import { ProductService } from 'src/app/services/product.service';
import { CartProduct, Order, OrderClasification, OrderStatus, PinCode, User } from 'src/bean/category';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {

  orderStatusList: Array<string> = ['PLACED','DISPATCH','NEAR','DELIVERY'];
  returnStatusList: Array<string> = ['PLACED','PICK UP','REFUND','COMPLETED'];

  orderDetsails : Order;
  orderId : string;
  tableName : string;
  cancelled : boolean;
  orderClasification: OrderClasification;
  icon : string;
  showLess : boolean = true;
  user : User;
  orderOrReturnStatusList : Array<OrderStatus> =[];

  constructor(private categoryService : CategoryService,
    private productService : ProductService,
    private route: ActivatedRoute,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private localStorageObject: LocalStoreObjectService) { 
      this.icon = "../../../"+environment.icon;
      window.scroll(0,0);
      this.route.queryParams.subscribe(params => {
        this.orderId = params.orderId;
        this.tableName = params.tableName;
      });
      this.user =  this.localStorageObject.getObject(LocalStoreObjectService.USER_KEY);
    }

  ngOnInit(): void {
    this.ngxService.start();
    this.categoryService.getOrderDetails(this.tableName,this.orderId).then(order => {
      this.orderDetsails = order.data() as Order;
      this.orderDetsails.id = order.id;
      this.updateOrderStatusList(this.orderDetsails.orderStatusList);
      if(this.tableName==this.categoryService.RETURN_TABLE){
        this.orderClasification = OrderClasification.RETURN;
      }else{
        if(this.orderDetsails.orderStatusList.find(s => s.orderStatus == 'CANCELLED')){
          this.orderClasification = OrderClasification.CANCELLED;
        }else{
          this.orderClasification = OrderClasification.PLACED;
        }
      }
      this.ngxService.stop();
    });
  }
  updateOrderStatusList(orderStatusList: OrderStatus[]) {
    this.orderOrReturnStatusList = [];
      this.cancelled = orderStatusList.find(s => s.orderStatus == 'CANCELLED') ? true:false;      
      let statusList = this.tableName==this.categoryService.ORDER_TABLE?this.orderStatusList:this.returnStatusList;
      for(let i=0;i<statusList.length;i++){
        let statusTxt = statusList[i];
        let orderFromDB = orderStatusList.find(s=>s.orderStatus == statusTxt);
        if(orderFromDB){
          this.orderOrReturnStatusList.push({... orderFromDB});
        }else{
          if(this.cancelled){
            this.orderOrReturnStatusList.push({... orderStatusList.find(s => s.orderStatus == 'CANCELLED')});
            break;
          }else{
            this.orderOrReturnStatusList.push({
              orderStatus : statusTxt,
              date : undefined
            });
          }
        }
      }
  }

  cancelOrder(){

    const confirmCancel = this.modalService.open(ConfirmBoxComponent);
    confirmCancel.componentInstance.image = "../../assets/shopping.png";
    confirmCancel.componentInstance.heading = "Cancel";
    confirmCancel.componentInstance.details = "Are you sure you want to cancel this order?";
    confirmCancel.componentInstance.positiveText = "YES";
    confirmCancel.componentInstance.negativeText = "NO";

    confirmCancel.result.then(result=>{
      if(result){
        this.ngxService.start();
        this.categoryService.cancelOrderOrRefund(this.tableName,this.orderDetsails.id).then(()=>{
          this.orderDetsails.currentOrderStatus = 'CANCELLED';
          this.orderDetsails.orderStatusList.push({
            orderStatus : 'CANCELLED',
            date : new Date().toISOString()
          })
          this.orderClasification = OrderClasification.CANCELLED;
          this.updateOrderStatusList(this.orderDetsails.orderStatusList);
          this.productService.updateProductCountAfterCancel(this.orderDetsails);
          this.ngxService.stop();
        });
      }
    }).catch(e=>{
      
    });
  }

  returnOrder(id : string , cartItem : CartProduct,parentOrderDate:string){

    const confirmreturn = this.modalService.open(ConfirmBoxComponent);
    confirmreturn.componentInstance.image = "../../assets/shopping.png";
    confirmreturn.componentInstance.heading = "Return";
    confirmreturn.componentInstance.details = "Are you sure you want to return this order?";
    confirmreturn.componentInstance.positiveText = "YES";
    confirmreturn.componentInstance.negativeText = "NO";

    confirmreturn.result.then(result=>{
      if(result){
        if(cartItem.quantity>1){
          const modalRef = this.modalService.open(SelectQuantityComponent);
          modalRef.componentInstance.maxCount = cartItem.quantity;
          modalRef.result.then(result=>{
            if(result){
              this.placeReturnOrder(id,cartItem,this.tableName != 'billing',result,parentOrderDate);
            }
          }).catch(e=>{
          });
        }else{
          this.placeReturnOrder(id,cartItem,this.tableName != 'billing',1,parentOrderDate);
        }
      }
    }).catch(e=>{
      
    });

  
  }
  async placeReturnOrder(id : string, cartItem : CartProduct, checkPinCode: boolean, quantity: number,parentOrderDate:string) {
    this.ngxService.start();
    let delivertDate = new Date();
    if(checkPinCode){
      let doc = await this.categoryService.getPincodeAvailable(this.orderDetsails.address.pinCode);
      if(doc.exists){
        let deliveryStatus = doc.data() as PinCode;
        if(deliveryStatus.pinCodeDeliveryDelay){
          let totalDelay : number = cartItem.product.productDeliveryDelay + deliveryStatus.pinCodeDeliveryDelay;
          delivertDate.setDate(delivertDate.getDate()+totalDelay);
        }
      }
    }
    cartItem.delivertDate = delivertDate.toISOString();
    cartItem.quantity = quantity;
    let returnOrder :Order = {
      hide:false,
      parentOrderDate : parentOrderDate,
      address : this.orderDetsails.address,
      cartProducts : [cartItem],
      convenienceFee : this.orderDetsails.convenienceFee,
      currentOrderStatus : checkPinCode?"PLACED":"RETURN",
      id : "",
      inPersonDiscount : 0,
      includeConvenienceFee : this.orderDetsails.includeConvenienceFee,
      mobileNumber : this.orderDetsails.mobileNumber,
      orderStatusList : checkPinCode ? [{
        orderStatus : "PLACED",
        date : new Date().toISOString()
      }]:[],
      total : cartItem.product.discountPrice*quantity-this.orderDetsails.inPersonDiscount,
      totalMRP : cartItem.product.discountPrice*quantity,
      placedDate : new Date().toISOString(),
      paymentMode : this.orderDetsails.paymentMode,
      paymentDetails : this.orderDetsails.paymentDetails,
      parentOrderId : id
    }
    let document = await this.categoryService.placeReturn(returnOrder);
    this.productService.updateProductReturnCount(cartItem);
    this.toastr.success("Your return initiated");
    this.router.navigate(['/order-details'],{queryParams : {orderId:document.id,tableName:'return'}}).then(()=>{
      window.location.reload();
      this.ngxService.stop();
    });
    this.ngxService.stop();
  }
  printBill(){
    const confirmreturn = this.modalService.open(PrintComponent);
    confirmreturn.componentInstance.billNumber = this.orderDetsails.id;
    confirmreturn.componentInstance.addedProducts = this.orderDetsails.cartProducts;
    confirmreturn.result.then(result=>{
      if(result){
           
      }
    }).catch(e=>{
    });
  }

}
