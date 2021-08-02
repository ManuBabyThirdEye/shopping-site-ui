import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStoreObjectService {

  public static USER_KEY = "user_key";

  constructor() { }

  setObject(key : string, value : any){
    localStorage.setItem(key,JSON.stringify(value));
  }

  getObject(key : string){
    return JSON.parse(localStorage.getItem(key));
  }

  removeObject(key : string){
    localStorage.removeItem(key);
  }

}
