import { Component, OnInit } from '@angular/core';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PickDateTimeComponent } from 'src/app/app-modal/pick-date-time/pick-date-time.component';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { CartProduct, Order, OrderStatus } from 'src/bean/category';

@Component({
  selector: 'app-admin-order-list',
  templateUrl: './admin-order-list.component.html',
  styleUrls: ['./admin-order-list.component.scss']
})
export class AdminOrderListComponent implements OnInit {

  orderList : Array<Order>= [];
  selectedStatus : string = undefined;
  orderStatusList : Array<string> = ["PLACED","DISPATCH","NEAR","DELIVERY","CANCELLED"];
  returnStatusList : Array<string> = ["PLACED","PICK UP",'REFUND','COMPLETED',"CANCELLED"];
  actionWithStatus : Map<string,Array<string>> = new Map();

  pageLimit : number = 20;
  totalOrderCount : number = 0;
  lastDocument  = undefined;
  firstDocument  = undefined;
  prevInactive : boolean = true;
  nextInactive : boolean = false; 
  firstOrderId : string;
  tableName: string ;

  constructor(public categoryService : CategoryService,
    public productService : ProductService, 
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private modalService: NgbModal) { 
      this.tableName = categoryService.ORDER_TABLE;
      this.actionWithStatus.set('PLACED-ORDER',['DISPATCH','CANCELLED']);
      this.actionWithStatus.set('DISPATCH-ORDER',['NEAR','CANCELLED']);
      this.actionWithStatus.set('NEAR-ORDER',['DELIVERY','CANCELLED']);
      this.actionWithStatus.set('DELIVERY-ORDER',[]);
      this.actionWithStatus.set('CANCELLED-ORDER',[]);
      this.actionWithStatus.set('PLACED-RETURN',['PICK UP','CANCELLED']);
      this.actionWithStatus.set('PICK UP-RETURN',['REFUND','CANCELLED']);
      this.actionWithStatus.set('REFUND-RETURN',['COMPLETED','CANCELLED']);
      this.actionWithStatus.set('COMPLETED-RETURN',[]);
      this.actionWithStatus.set('CANCELLED-RETURN',[]);
      this.getAllOrderList(this.tableName,this.selectedStatus,this.lastDocument,this.pageLimit,true,false);
  }

  getProductCount(cartList : Array<CartProduct>){
    let count : number  = 0;
    for (let cart  of cartList) {
      count += cart.quantity;
    }
    return count;
  }

  getAllOrderList(tableName : string,status : string,lastDocument : DocumentSnapshot<any>, pageLimit:number, isNext : boolean,isReload : boolean) {
    this.tableName = tableName;
    if(!lastDocument){
      this.prevInactive = true;
      this.nextInactive = false;
    }
    if(this.nextInactive && isNext && !isReload){
      return;
    }
    if(this.prevInactive && !isNext){
      return;
    }
    this.selectedStatus = status;
    this.ngxService.start();
    this.categoryService.getOrderByStatusCount(this.selectedStatus).then(sDoc=>{
      this.totalOrderCount = sDoc;
    });
    this.categoryService.getAllOrders(tableName,status,lastDocument,pageLimit,isNext,isReload).then(docs=>{
      if(docs.size>0 || !lastDocument){
        this.orderList = docs.docs.map(doc=>{
          let order = doc.data() as Order;
          order.id = doc.id;
          return order;
        });
        if(isNext && !lastDocument && this.orderList.length>0){
          this.firstOrderId = this.orderList[0].id;
        }
        if(docs.size>0){
          if(docs.docs[docs.size-1].exists){
            this.lastDocument = docs.docs[docs.size-1];
          }
          if(docs.docs[0].exists){
            this.firstDocument = docs.docs[0];
          }
        }
      }
      if(isNext){
        this.nextInactive = docs.size<this.pageLimit;
        this.prevInactive = !lastDocument;
      }else if(!this.prevInactive){
        this.nextInactive = false;
        this.prevInactive = docs.size==0 || docs.docs[0].id==this.firstOrderId;
      }
      this.ngxService.stop();
    })
  }

  ngOnInit(): void {

  }
  getActionList(order : Order){
    let actionList =  this.actionWithStatus.get(order.currentOrderStatus+"-"+(this.tableName==this.categoryService.ORDER_TABLE?"ORDER":"RETURN"))
    return actionList?actionList:[];
  }

  updateStatus(order : Order,status : string){
    const modalRef = this.modalService.open(PickDateTimeComponent);    
    modalRef.result.then((result:Date)=>{
      if(result){
        let orderStatus : OrderStatus= {
          date : result.toISOString(),
          orderStatus : status
        }
        this.ngxService.start();
        this.categoryService.addOrderStatus(order.id,orderStatus,this.tableName).then(()=>{
          this.ngxService.stop();
          this.getAllOrderList(this.tableName,this.selectedStatus,this.firstDocument,this.pageLimit,true,true);
        })
      }
    }).catch(e=>{
      
    })
    
  }

}
