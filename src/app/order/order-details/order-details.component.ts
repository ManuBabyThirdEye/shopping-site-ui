import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CANCELLED } from 'dns';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmBoxComponent } from 'src/app/app-modal/confirm-box/confirm-box.component';
import { CategoryService } from 'src/app/services/category.service';
import { CartProduct, Order, OrderClasification, OrderStatus, PinCode } from 'src/bean/category';

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
  order : boolean;
  cancelled : boolean;
  orderClasification: OrderClasification;

  orderOrReturnStatusList : Array<OrderStatus> =[];

  constructor(private categoryService : CategoryService,
    private route: ActivatedRoute,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal) { 
      window.scroll(0,0);
      this.route.queryParams.subscribe(params => {
        this.orderId = params.orderId;
        this.order = params.order=="true";
      });
    }

  ngOnInit(): void {
    this.ngxService.start();
    this.categoryService.getOrderDetails(this.order,this.orderId).then(order => {
      console.log(order.exists);
      this.orderDetsails = order.data() as Order;
      console.log(this.orderDetsails);
      this.orderDetsails.id = order.id;
      this.updateOrderStatusList(this.orderDetsails.orderStatusList);
      if(!this.order){
        this.orderClasification = OrderClasification.RETURN;
      }else{
        if(this.orderDetsails.orderStatusList.find(s => s.orderStatus == 'CANCELLED')){
          this.orderClasification = OrderClasification.CANCELLED;
        }else{
          this.orderClasification = OrderClasification.PLACED;
        }
      }
      console.log(this.orderDetsails);
      this.ngxService.stop();
    });
  }
  updateOrderStatusList(orderStatusList: OrderStatus[]) {
    this.orderOrReturnStatusList = [];
      this.cancelled = orderStatusList.find(s => s.orderStatus == 'CANCELLED') ? true:false;      
      let statusList = this.order?this.orderStatusList:this.returnStatusList;
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
      console.log(this.orderOrReturnStatusList);
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
        this.categoryService.cancelOrderOrRefund(this.order,this.orderDetsails.id).then(()=>{
          this.orderDetsails.currentOrderStatus = 'CANCELLED';
          this.orderDetsails.orderStatusList.push({
            orderStatus : 'CANCELLED',
            date : new Date().toISOString()
          })
          this.orderClasification = OrderClasification.CANCELLED;
          this.updateOrderStatusList(this.orderDetsails.orderStatusList);
          this.categoryService.updateProductCountAfterCancel(this.orderDetsails);
          this.ngxService.stop();
        });
      }
    }).catch(e=>{
      
    });
  }

  returnOrder(cartItem : CartProduct){

    const confirmreturn = this.modalService.open(ConfirmBoxComponent);
    confirmreturn.componentInstance.image = "../../assets/shopping.png";
    confirmreturn.componentInstance.heading = "Return";
    confirmreturn.componentInstance.details = "Are you sure you want to return this order?";
    confirmreturn.componentInstance.positiveText = "YES";
    confirmreturn.componentInstance.negativeText = "NO";

    confirmreturn.result.then(result=>{
      if(result){
        this.ngxService.start();
    this.categoryService.getPincodeAvailable(this.orderDetsails.address.pinCode).then(doc=>{
      if(doc.exists){
        let deliveryStatus = doc.data() as PinCode;
        if(deliveryStatus.pinCodeDeliveryDelay){
          let totalDelay : number = cartItem.product.productDeliveryDelay + deliveryStatus.pinCodeDeliveryDelay;
          let delivertDate = new Date();
          delivertDate.setDate(delivertDate.getDate()+totalDelay);
          cartItem.delivertDate = delivertDate.toISOString();
          let returnOrder :Order = {
            address : this.orderDetsails.address,
            cartProducts : [cartItem],
            convenienceFee : this.orderDetsails.convenienceFee,
            currentOrderStatus : "PLACED",
            id : "",
            includeConvenienceFee : this.orderDetsails.includeConvenienceFee,
            mobileNumber : this.orderDetsails.mobileNumber,
            orderStatusList : [{
              orderStatus : "PLACED",
              date : new Date().toISOString()
            }],
            total : cartItem.product.discountPrice,
            totalMRP : cartItem.product.discountPrice,
            placedDate : new Date().toISOString()
          }
          this.categoryService.placeReturn(returnOrder).then((doc)=>{
            this.toastr.success("Your return initiated");
            this.router.navigate(['/order-details'],{queryParams : {orderId:doc.id,order:false}}).then(()=>{
              window.location.reload();
            });
            this.ngxService.stop();
          });
        }
      }
    });
      }
    }).catch(e=>{
      
    });

  
  }

}
