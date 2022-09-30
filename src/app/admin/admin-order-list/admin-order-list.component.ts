import { Component, OnInit } from '@angular/core';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmBoxComponent } from 'src/app/app-modal/confirm-box/confirm-box.component';
import { PickDateTimeComponent } from 'src/app/app-modal/pick-date-time/pick-date-time.component';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { LocalStoreObjectService } from 'src/app/services/local-store-object.service';
import { ProductService } from 'src/app/services/product.service';
import { CartProduct, Order, OrderStatus, User } from 'src/bean/category';

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
  user : User;

  constructor(public categoryService : CategoryService,
    public productService : ProductService, 
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private authService : AuthService,
    private localStorageObject : LocalStoreObjectService) { 
      this.user = this.localStorageObject.getObject(LocalStoreObjectService.USER_KEY);
      if(!this.user){
        this.authService.signedIn.subscribe(user => {
          if(user!= null){
            this.authService.getUserFromFirestore(user.phoneNumber).then(u => {
              this.user = u.data() as User;
              this.user.mobileNumber = u.id;
              this.localStorageObject.setObject(LocalStoreObjectService.USER_KEY,this.user);
            })
          }else{
            this.user = undefined;
          }
        })
      }
      this.route.queryParams.subscribe(params => {
        if(params.tableName){
          this.tableName = params.tableName;
        }else{
          this.tableName = categoryService.ORDER_TABLE;
        }
      });
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
      this.actionWithStatus.set('BILLING-ADMIN',['DELETE']);
      this.actionWithStatus.set('BILLING-UNHIDE',['HIDE','DELETE']);
      this.actionWithStatus.set('BILLING-HIDE',['UNHIDE','DELETE']);

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
    this.categoryService.getOrderByStatusCount(this.selectedStatus,this.user.superAdmin).then(sDoc=>{
      this.totalOrderCount = sDoc;
    });
    this.categoryService.getAllOrders(tableName,status,lastDocument,pageLimit,isNext,isReload,this.user.superAdmin).then(docs=>{
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
    
    if(this.tableName=='billing'){
      if(this.user && this.user.superAdmin){
        if(order.hide){
          return this.actionWithStatus.get('BILLING-HIDE');
        }else{
          return this.actionWithStatus.get('BILLING-UNHIDE');
        }
      }else if(this.user && this.user.admin){
        return this.actionWithStatus.get('BILLING-ADMIN');
      }
      
    }
    let actionList =  this.actionWithStatus.get(order.currentOrderStatus+"-"+(this.tableName==this.categoryService.ORDER_TABLE?"ORDER":"RETURN"))
    return actionList?actionList:[];
  }

  updateStatus(order : Order,status : string){
    if(status=='HIDE'){
      const confirmreturn = this.modalService.open(ConfirmBoxComponent);
      confirmreturn.componentInstance.image = "../../assets/barrier.png";
      confirmreturn.componentInstance.heading = "Hide Billing";
      confirmreturn.componentInstance.details = "Do you want to hide this billing?";
      confirmreturn.componentInstance.positiveText = "YES";
      confirmreturn.componentInstance.negativeText = "NO";
      confirmreturn.result.then((result:Date)=>{
        if(result){
          this.ngxService.start();
          this.categoryService.revertBilling(order.id,this.tableName,true).then(()=>{
            this.ngxService.stop();
            this.getAllOrderList(this.tableName,this.selectedStatus,this.firstDocument,this.pageLimit,true,true);
          })
        }
      }).catch(e=>{
        
      })
    }else if(status=='UNHIDE'){
      const confirmreturn = this.modalService.open(ConfirmBoxComponent);
      confirmreturn.componentInstance.image = "../../assets/barrier.png";
      confirmreturn.componentInstance.heading = "Unhide Billing";
      confirmreturn.componentInstance.details = "Do you want to Un-hide this billing?";
      confirmreturn.componentInstance.positiveText = "YES";
      confirmreturn.componentInstance.negativeText = "NO";
      confirmreturn.result.then((result:Date)=>{
        if(result){
          this.ngxService.start();
          this.categoryService.revertBilling(order.id,this.tableName,false).then(()=>{
            this.ngxService.stop();
            this.getAllOrderList(this.tableName,this.selectedStatus,this.firstDocument,this.pageLimit,true,true);
          })
        }
      }).catch(e=>{
        
      })
    }else if(status=='DELETE'){
      const confirmreturn = this.modalService.open(ConfirmBoxComponent);
      confirmreturn.componentInstance.image = "../../assets/barrier.png";
      confirmreturn.componentInstance.heading = "Delete Billing";
      confirmreturn.componentInstance.details = "Do you want to delete this billing?";
      confirmreturn.componentInstance.positiveText = "YES";
      confirmreturn.componentInstance.negativeText = "NO";
      confirmreturn.result.then((result:Date)=>{
        if(result){
          this.ngxService.start();
          this.categoryService.deleteBilling(order,this.tableName).then(()=>{
            this.ngxService.stop();
            this.getAllOrderList(this.tableName,this.selectedStatus,this.firstDocument,this.pageLimit,true,true);
          })
        }
      }).catch(e=>{
        
      })
    }else{
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

}
