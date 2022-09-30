import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Order, Product } from 'src/bean/category';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  

  COUNTER_TABLE : string = 'counter';
  MONTH_MAPPER : Map<number,string> = new Map();

  ITEM_NO :string = "ITEM NO";
  ITEM_NAME : string ="ITEM NAME";
  DESCRIPTION : string = "DESCRIPTION";
  DISCOUNT_AMOUNT : string = "DISCOUNT AMOUNT";
  DISCOUNT : string ="DISCOUNT";

  constructor(private firestore : AngularFirestore) { 
    this.MONTH_MAPPER.set(0,"Jan");
    this.MONTH_MAPPER.set(1,"Feb");
    this.MONTH_MAPPER.set(2,"Mar");
    this.MONTH_MAPPER.set(3,"Apr");
    this.MONTH_MAPPER.set(4,"May");
    this.MONTH_MAPPER.set(5,"Jun");
    this.MONTH_MAPPER.set(6,"Jul");
    this.MONTH_MAPPER.set(7,"Aug");
    this.MONTH_MAPPER.set(8,"Sep");
    this.MONTH_MAPPER.set(9,"Oct");
    this.MONTH_MAPPER.set(10,"Nov");
    this.MONTH_MAPPER.set(11,"Dec");
  }

  async getNextCounter(tableName:string){
    let counterRef = this.firestore.collection(this.COUNTER_TABLE).doc(tableName);
    let newCounter = await counterRef.get().toPromise().then(countDoc => {
      if(countDoc.exists){
        return countDoc.get('counter') as number;
      }
      else{
        return 1000;
      }
    })
    if(newCounter == 1000){
      await counterRef.set({
        counter : newCounter+1
      })
    }else{
      await counterRef.update({
        counter : newCounter+1
      })
    }
    return newCounter;
  }

  isUrl(url:string){
    return url.startsWith("https://firebasestorage");
  }

  getMonthName(n : number){
    return this.MONTH_MAPPER.get(n);
  }

  convertBillingToJson(orderList: Order[],returnList : Order[]): unknown[] {
    let jsonArray = [];
    orderList.forEach(o=>{
      let returnItem = returnList.filter(r=>r.parentOrderId==o.id);
      if(returnItem && returnItem.length>0){
        returnItem.forEach(r=>{
          o.total = o.total-r.total;
        });
        o.total = o.total<0?0:o.total;
      }
      let date = o.placedDate.split("T")[0];
      let existingDocIndex = -1;
      if(existingDocIndex!=-1){
        let existingDoc = jsonArray[existingDocIndex];
        console.log(existingDoc);
        console.log(parseFloat(existingDoc["GST 5%"]));
        existingDoc["AMOUNT"] = parseFloat(existingDoc["AMOUNT"])+o.total;
        existingDoc["BILL NO"] = existingDoc["BILL NO"]+","+o.id;
        existingDoc["GST 5%"] = parseFloat(existingDoc["GST 5%"])+(o.total<1000?this.calculateGST(o.total,5):0);
        existingDoc["CGST 2.5%"] = parseFloat(existingDoc["CGST 2.5%"])+(o.total<1000?this.calculateGST(o.total,2.5):0);
        existingDoc["SGST 2.5%"] = parseFloat(existingDoc["SGST 2.5%"])+(o.total<1000?this.calculateGST(o.total,2.5):0);
        existingDoc["GST 12%"] = parseFloat(existingDoc["GST 12%"])+(o.total>=1000?this.calculateGST(o.total,12):0);
        existingDoc["CGST 6%"] = parseFloat(existingDoc["CGST 6%"])+(o.total>=1000?this.calculateGST(o.total,6):0);
        existingDoc["SGST 6%"] = parseFloat(existingDoc["SGST 6%"])+(o.total>=1000?this.calculateGST(o.total,6):0);
        existingDoc["TOTAL GST"] = existingDoc["GST 5%"] + existingDoc["GST 12%"];
        jsonArray[existingDocIndex] = existingDoc;
      }else{
        jsonArray.push({
          "DATE" : date,
          "BILL NO" : o.id,
          "AMOUNT" : o.total,
          "GST 5%" : o.total<1000?this.calculateGST(o.total,5):0,
          "CGST 2.5%" : o.total<1000?this.calculateGST(o.total,2.5):0,
          "SGST 2.5%" : o.total<1000?this.calculateGST(o.total,2.5):0,
          "GST 12%" : o.total>=1000?this.calculateGST(o.total,12):0,
          "CGST 6%" : o.total>=1000?this.calculateGST(o.total,6):0,
          "SGST 6%" : o.total>=1000?this.calculateGST(o.total,6):0,
          "TOTAL GST" : o.total<1000?this.calculateGST(o.total,5):0+o.total>=1000?this.calculateGST(o.total,12):0
        });
      }      
    })
    let tatalAmount = 0;
    let tatalgst5 = 0;
    let tatalcgst5 = 0;
    let tatalsgst5 = 0;
    let tatalgst12 = 0;
    let tatalcgst12 = 0;
    let tatalsgst12 = 0;
    let tatalgst = 0;

    jsonArray.forEach(doc=>{
      tatalAmount += parseFloat(doc["AMOUNT"]);
      tatalgst5 += parseFloat(doc["GST 5%"]);
      tatalcgst5 += parseFloat(doc["CGST 2.5%"]);
      tatalsgst5 += parseFloat(doc["SGST 2.5%"]);
      tatalgst12 += parseFloat(doc["GST 12%"]);
      tatalcgst12 += parseFloat(doc["CGST 6%"]);
      tatalsgst12 += parseFloat(doc["SGST 6%"]);
      tatalgst += parseFloat(doc["TOTAL GST"]);
    })
    jsonArray.push({
      "DATE" : "------",
      "BILL NO" : "------",
      "AMOUNT" : "------",
      "GST 5%" : "------",
      "CGST 2.5%" : "------",
      "SGST 2.5%" : "------",
      "GST 12%" : "------",
      "CGST 6%" : "------",
      "SGST 6%" : "------",
      "TOTAL GST" : "------"
    });

    jsonArray.push({
      "DATE" : "",
      "BILL NO" : "",
      "AMOUNT" : tatalAmount,
      "GST 5%" : tatalgst5,
      "CGST 2.5%" : tatalcgst5,
      "SGST 2.5%" : tatalsgst5,
      "GST 12%" : tatalgst12,
      "CGST 6%" : tatalcgst12,
      "SGST 6%" : tatalsgst12,
      "TOTAL GST" : tatalgst
    });

    console.log(jsonArray)

    return jsonArray;
  }

  calculateGST(total: number, gst: number) {
    return Math.round(total*(1-(100/(100+gst)))*100)/100;
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


  removeUndefined(bill: any): any {
    Object.keys(bill).forEach(key => {
      if (bill[key] === undefined) {
        delete bill[key];
      }else if(bill[key] instanceof Map){
        bill[key] = this.mapToObj(bill[key]);
      }else if(bill[key] instanceof Object){
        this.removeUndefined(bill[key]);
      } else if(bill[key] instanceof Array){
        if(bill[key].length > 0){
          bill[key].forEach(element => {
            this.removeUndefined(element);
          });
        }
      }
    });
    return bill;
  }
  mapToObj(inputMap: any): any {
    let obj = {};
    inputMap.forEach(function(value, key){
        obj[key] = value
    });
    return obj;
  }
  
}
