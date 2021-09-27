import { Component, OnInit } from '@angular/core';
import firebase from 'firebase';
import * as Highcharts from 'highcharts';
import { CategoryService } from 'src/app/services/category.service';
import { UtilService } from 'src/app/services/util.service';
import { Order, Revenue } from 'src/bean/category';
import HC_drilldown from 'highcharts/modules/drilldown';


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

  constructor(private categoryService : CategoryService,private utilService : UtilService) { 
    HC_drilldown(Highcharts);
  }

  ngOnInit(): void {
    let sixMonthOld = new Date();
    sixMonthOld.setMonth(sixMonthOld.getMonth()-6);
    sixMonthOld.setDate(1);
    this.categoryService.getAllOrdersReturnBillingByDate("billing",sixMonthOld.toISOString()).then(billingList=>{
      if(billingList){
        let orderList = billingList.docs.map(o=>{
          let order = o.data() as Order;
          order.id = o.id;
          return order;
        })
        let getMonthData = this.getDataByMonth(orderList);
        let drilldownData = this.getDataByDayDrilldown(orderList);

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
  getDataByDayDrilldown(orderList: Order[]) {
    let map : Map<string,Map<string,Revenue>>= new Map();
    orderList.forEach(b=>{
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
      curDayRevenue.amount += b.total;
      if(b.cartProducts && b.cartProducts.length >0){
        b.cartProducts.forEach(p=>{
          curDayRevenue.count +=p.quantity;
        })
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
  getDataByMonth(orderList: Order[]) {
    let map : Map<string,Revenue>= new Map();
    orderList.forEach(b=>{
      let date = new Date(b.placedDate);
      let month = this.utilService.getMonthName(date.getMonth())+"-"+date.getFullYear();
      if(!map.get(month)){
        map.set(month,{
          amount : 0,
          count : 0
        })
      }
      let curRevenue = map.get(month);
      curRevenue.amount += b.total;
      if(b.cartProducts && b.cartProducts.length >0){
        b.cartProducts.forEach(p=>{
          curRevenue.count +=p.quantity;
        })
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
