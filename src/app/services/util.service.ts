import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  COUNTER_TABLE : string = 'counter';

  constructor(private firestore : AngularFirestore) { }

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
  
}
