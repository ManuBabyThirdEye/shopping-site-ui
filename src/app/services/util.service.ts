import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  COUNTER_TABLE : string = 'counter';
  MONTH_MAPPER : Map<number,string> = new Map();

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
  
}
