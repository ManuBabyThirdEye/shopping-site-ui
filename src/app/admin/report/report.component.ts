import { Component, OnInit } from '@angular/core';
import firebase from 'firebase';
import * as Highcharts from 'highcharts';
import { CategoryService } from 'src/app/services/category.service';
import { UtilService } from 'src/app/services/util.service';
import { Order, Revenue, User } from 'src/bean/category';
import HC_drilldown from 'highcharts/modules/drilldown';
import { LocalStoreObjectService } from 'src/app/services/local-store-object.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; // required
  chartConstructor: string = 'chart'; // optional string, defaults to 'chart'
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Revenue'
    },
    series: [{
      data: [],
      type: 'column'
    }]
  }; // required
  chartCallback: Highcharts.ChartCallbackFunction = function (chart) {  } // optional function, defaults to null
  updateFlag: boolean = false; // optional boolean
  oneToOneFlag: boolean = true; // optional boolean, defaults to false
  runOutsideAngularFlag: boolean = false; // optional boolean, defaults to false

  chartOptionsTransactionCount : Highcharts.Options = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Revenue'
    },
    series: [{
      data: [],
      type: 'column'
    }]
  }; 

  user : User;

  constructor(private categoryService : CategoryService,
    private utilService : UtilService,
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
      HC_drilldown(Highcharts);
  }

  ngOnInit(): void {

    let sixMonthOld = new Date();
    sixMonthOld.setMonth(sixMonthOld.getMonth()-6);
    sixMonthOld.setDate(1);

    let  billingListPromise : Promise<Array<Order>> = this.categoryService.getAllOrdersReturnBillingByDate("billing",sixMonthOld.toISOString(),this.user.superAdmin);
    let  returnListPromise : Promise<Array<Order>> = this.categoryService.getAllReturnBillingByDate("return",sixMonthOld.toISOString(),this.user.superAdmin);
    Promise.all([billingListPromise,returnListPromise]).then(result=>{
      let billingList = result[0];
      let returnList = result[1];
      if(billingList){
        let getMonthData = this.getDataByMonth(billingList,returnList);
        let drilldownData = this.getDataByDayDrilldown(billingList,returnList);

        this.chartOptions = {
          chart: {
            type: 'column'
          },
          title: {
            text: 'REVENUE'
          },
          tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> of total<br/>'
          },
          plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
          },
          accessibility: {
              announceNewData: {
                  enabled: true
              }
          },
          xAxis: {
              type: 'category'
          },
          yAxis: {
            title: {
                text: 'Revenue'
            }
          },
          legend: {
            enabled: false
          },
          series: [{
            name: "Month",
            colorByPoint: true,
            data: getMonthData.dataRevenew,
            type: 'column'
          }],
          drilldown: {
            series: drilldownData.dataRevenew
          }
        };

        this.chartOptionsTransactionCount = {
          chart: {
            type: 'column'
          },
          title: {
            text: 'ITEM COUNT'
          },
          tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> of total<br/>'
          },
          plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
          },
          accessibility: {
              announceNewData: {
                  enabled: true
              }
          },
          xAxis: {
              type: 'category'
          },
          yAxis: {
            title: {
                text: 'Item Count'
            }
          },
          legend: {
            enabled: false
          },
          series: [{
            name: "Month",
            colorByPoint: true,
            data: getMonthData.dataCount,
            type: 'column'
          }],
          drilldown: {
            series: drilldownData.dataCount
          }
        };
        console.log(this.chartOptions);
      }
    })
    
  }
  getDataByDayDrilldown(billingList: Order[],returnList : Order[]) {
    let map : Map<string,Map<string,Revenue>>= new Map();
    billingList.forEach(b=>{
      let date = new Date(b.placedDate);
      let month = this.utilService.getMonthName(date.getMonth())+"-"+date.getFullYear();
      if(!map.get(month)){
        map.set(month,new Map())
      }
      let curMonthRevenue = map.get(month);
      let day = date.getDate()+"-"+this.utilService.getMonthName(date.getMonth())+"-"+date.getFullYear();
      if(!curMonthRevenue.get(day)){
        curMonthRevenue.set(day,{
          amount : 0,
          count : 0
        })
      }
      let curDayRevenue = curMonthRevenue.get(day);
      let returnItems = returnList.filter(r=>r.parentOrderId==b.id);
      let billTotal = b.total;
      if(returnItems && returnItems.length>0){
        returnItems.forEach(r=>{
          billTotal = billTotal-r.total;
        });
        billTotal = billTotal<0?0:billTotal;
      }
      curDayRevenue.amount += (billTotal<0?0:billTotal);
      if(b.cartProducts && b.cartProducts.length >0){
        b.cartProducts.forEach(p=>{
          curDayRevenue.count +=p.quantity;
        });
        if(returnItems && returnItems.length>0){
          returnItems.forEach(r=>{
            r.cartProducts.forEach(r=>{
              curDayRevenue.count -=r.quantity;
            })
          });
        }
      }
      curMonthRevenue.set(day,curDayRevenue);
      map.set(month,curMonthRevenue);
    });
    let dataRevenew = [];
    let dataCount = [];

    map.forEach((v,k)=>{
      let daySeries = [];
      let daySeriesCount = [];

      v.forEach((dv,dk)=>{
        let tmp = [];
        tmp.push(dk);
        tmp.push(dv.amount);
        daySeries.push(tmp);
        let tmpCount = [];
        tmpCount.push(dk);
        tmpCount.push(dv.count);
        daySeriesCount.push(tmpCount);
      })
      dataRevenew.push({
        name : k,
        id : k,
        data : daySeries
      })
      dataCount.push({
        name : k,
        id : k,
        data : daySeriesCount
      })
    })
    return {
      dataRevenew : dataRevenew,
      dataCount : dataCount
    };
  }
  getDataByMonth(billingList: Order[],returnList : Order[]) {
    let map : Map<string,Revenue>= new Map();
    billingList.forEach(b=>{
      let date = new Date(b.placedDate);
      let month = this.utilService.getMonthName(date.getMonth())+"-"+date.getFullYear();
      if(!map.get(month)){
        map.set(month,{
          amount : 0,
          count : 0
        })
      }
      let curRevenue = map.get(month);
      let returnItems = returnList.filter(r=>r.parentOrderId==b.id);
      let billTotal = b.total;
      if(returnItems && returnItems.length>0){
        returnItems.forEach(r=>{
          billTotal = billTotal-r.total;
        });
        billTotal = billTotal<0?0:billTotal;
      }
      curRevenue.amount += (billTotal<0?0:billTotal);
      if(b.cartProducts && b.cartProducts.length >0){
        b.cartProducts.forEach(p=>{
          curRevenue.count +=p.quantity;
        })
        if(returnItems && returnItems.length>0){
          returnItems.forEach(r=>{
            r.cartProducts.forEach(r=>{
              curRevenue.count -=r.quantity;
            })
          });
        }
      }
      map.set(month,curRevenue);
    })


    let dataRevenew = [];
    let dataCount = [];

    map.forEach((v,k)=>{
      dataRevenew.push({
        name : k,
        y : v.amount,
        drilldown : k
       })
       dataCount.push({
        name : k,
        y : v.count,
        drilldown : k
       })
    })
    return {
      dataRevenew : dataRevenew,
      dataCount : dataCount
    };
  }

}
