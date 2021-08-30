import { Injectable } from '@angular/core';
import Localbase from 'localbase'
import { Order, Product } from 'src/bean/category';

@Injectable({
  providedIn: 'root'
})
export class LocaldbService {
  
  
  
  localDB :Localbase;

  PRODUCT_TABLE : string = 'product';
  BILLING_TABLE : string = 'billing';


  constructor() { 
    this.localDB = new Localbase('shoping-site');
  }

  updateLocalProducts(products: Array<Product>) {
    products.forEach(p=>{
      if(this.getProductById(p.id)){
        this.localDB.collection(this.PRODUCT_TABLE).doc({ id: p.id }).update(p);
      }else{
        this.localDB.collection(this.PRODUCT_TABLE).add(p);
      }
    })
  }

  getAllProductFormLocal() : Promise<Array<Product>>{
    return this.localDB.collection(this.PRODUCT_TABLE).get();
  }

  getProductById(id: string) {
    return  this.localDB.collection(this.PRODUCT_TABLE).doc({ id: id }).get();
  }

  addNewProduct(product: Product) {
    this.localDB.collection(this.PRODUCT_TABLE).add(product);
  }

  addNewBilling(order: Order) {
    this.localDB.collection(this.BILLING_TABLE).doc(order.id).set(order);
  }
  getAllBillingFormLocal() : Promise<Array<any>>{
    return this.localDB.collection(this.BILLING_TABLE).get();
  }


  updateBillingSuccess(id: any) {
    this.localDB.collection(this.BILLING_TABLE).doc(id).update({remoteSuccess:true});
  }

  async reduceProductCountAndPlaceOrder(cart: any) {
    let updatedProducts : Array<Product> = [];
    for(let cartProd of cart.cartProducts){
      let product : Product = await this.getProductById(cartProd.product.id);
      let index = product.availableSizes.findIndex(s=>s.size==cartProd.size);
      if(index != -1){
        product.availableSizes[index].count = product.availableSizes[index].count - cartProd.quantity;
        updatedProducts.push(product);
      }
    }
    this.updateLocalProducts(updatedProducts);
    this.addNewBilling(cart);
  }

}
