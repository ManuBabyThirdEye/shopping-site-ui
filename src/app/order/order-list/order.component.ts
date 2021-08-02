import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { Order } from 'src/bean/category';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  CANCELED_ORDER_STATUS : Array<string> = ["CANCELED","RETURNED"];

  orderList : Array<Order> = [];

  returnList : Array<Order> = [];

  showOrder : boolean = true;

  constructor( private categoryService : CategoryService,
    private ngxService: NgxUiLoaderService) { 
      window.scroll(0,0);
    }

  ngOnInit(): void {
    this.ngxService.start();
    this.categoryService.getOrdersOrReturn(true).then(docs=>{
      docs.forEach(doc=>{
        let order = doc.data() as Order;
        order.id = doc.id;
        this.orderList.push(order);
      })
      this.ngxService.stop();
    })
    this.categoryService.getOrdersOrReturn(false).then(docs=>{
      docs.forEach(doc=>{
        let order = doc.data() as Order;
        order.id = doc.id;
         this.returnList.push(order);
      })
    }).catch(e=>{
      
    })
  }

  getMaxDeliveryDate(order : Order){
    let maxDate : Date;
    if(order.cartProducts){
      order.cartProducts.forEach(prod=>{
        if(maxDate==undefined || maxDate < new Date(prod.delivertDate)){
          maxDate = new Date(prod.delivertDate);
        }
      })
    }
    return maxDate;
  }
  getDeliveryDate(order : Order){
    return order.orderStatusList.find(s => s.orderStatus =='DELIVERY').date;
  }
  
}
