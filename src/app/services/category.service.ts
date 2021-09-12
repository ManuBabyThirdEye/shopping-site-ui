import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentData, DocumentReference, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { Order, CartProduct, Product, Address, User, MainCategory, AllSize, Size, PinCode, OrderStatus } from 'src/bean/category';
import firebase from "firebase/app";
import { ToastrService } from 'ngx-toastr';
import { LocalStoreObjectService } from './local-store-object.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../services/product.service'

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  
  CATEGORY_TABLE : string = 'category';
  FILTER_TABLE : string = 'filter-category';
  USER_TABLE : string = 'user';
  USER_WISHLIST_TABLE : string = 'wishlist';
  USER_ADDRESS_TABLE : string = 'address';
  CART_TABLE : string = 'cart';
  PINCODE_TABLE : string = 'pincode';
  ORDER_TABLE : string = 'order';
  RETURN_TABLE : string = 'return';


  constructor(private firestore : AngularFirestore,
    private toastr: ToastrService,
    private local : LocalStoreObjectService,
    private fireStorage : AngularFireStorage,
    private modalService: NgbModal,
    private productService : ProductService) { 
      
  }

  getAllCategoryList() : Promise<QuerySnapshot<any>> {
    return this.firestore.collection(this.CATEGORY_TABLE, ref=>ref.orderBy("order")).get().toPromise();
  }

  getFilter(categoryId: string) : Promise<firebase.firestore.DocumentSnapshot<unknown>> {
    return this.firestore.collection(this.FILTER_TABLE).doc(categoryId).get().toPromise();
  }

  

  getAdmins() {
    return this.firestore.collection(this.USER_TABLE, ref => ref.where("admin","==",true)).get().toPromise();
  }

  upgradUserToAdmin(numnber: string) {
    return this.firestore.collection(this.USER_TABLE).doc(numnber).get().toPromise().then(_doc=>{
      if(_doc.exists){
        return this.firestore.collection(this.USER_TABLE).doc(numnber).update({"admin":true}).then(()=>{
          return true;
        })
      }
      return false;
    })
  }

  downgradUserFromAdmin(numnber: string) {
    return this.firestore.collection(this.USER_TABLE).doc(numnber).update({"admin":false});
  }
  

  addToWishList(product: Product) {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.USER_WISHLIST_TABLE).doc(product.id).set({
      discountPrice : product.discountPrice,
      discount : product.discount,
      image : product.images[0],
      sizes : product.availableSizeString
    })
  }

  addToCart(product: Product, size: string, quantity : number) {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.CART_TABLE, ref => ref.where("size","==",size).where("productId","==",product.id)).get()
    .toPromise().then(res => {
      if(res.size<=0){
        return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
        .collection(this.CART_TABLE).add({
          productId : product.id,
          size : size,
          quantity : quantity,
          productRef : this.productService.getProductRef(product.id)
        }).then(r=>{
          this.toastr.success("Product added to your cart, go to cart for checkout");
        })
      }else{
        this.toastr.warning("This product is already added, Please go to cart")
      }
    })
  }

  removeFromCart(cartId: string){
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.CART_TABLE).doc(cartId).delete();
  }

  updateProductQuantity(cartId: string, quantity : number){
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.CART_TABLE).doc(cartId).update({"quantity":quantity});
  }

  updateProductSize(cartId: string, size: string){
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.CART_TABLE).doc(cartId).update({"size":size});
  }
  

  getWishListSnapshot() :Observable<DocumentChangeAction<DocumentData>[]> {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.USER_WISHLIST_TABLE).snapshotChanges();
  }

  getWishList() :Promise<QuerySnapshot<DocumentData>> {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.USER_WISHLIST_TABLE).get().toPromise();
  }
  removeFromWishList(productId: string) :Promise<void> {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.USER_WISHLIST_TABLE).doc(productId).delete();
  }

  getPincodeAvailable(pinCode: string) {
    return this.firestore.collection(this.PINCODE_TABLE).doc(pinCode).get().toPromise();
  }

  getProductListForCart() {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.CART_TABLE).get().toPromise().then(carts => {
      return carts.docs.map(cartDoc => {
        let cartProduct = cartDoc.data() as CartProduct;
        cartProduct.cartId = cartDoc.id;
        return cartProduct.productRef.get().then(pro => {
          cartProduct.product = pro.data() as Product;
          cartProduct.product.id = pro.id;
          cartProduct.product.availableSizes = [];
          return this.productService.getAvailableSizeFromProductId(pro.id).then(sizes=>{
            cartProduct.product.availableSizes = sizes;
            return cartProduct;
          })
        });
      })
    })
  }

  getAddressListFromUser() {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.USER_ADDRESS_TABLE).stateChanges();
  }

  addAddress(value: any) {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.USER_ADDRESS_TABLE).add(value);
  }

  removeAddress(addressId: string) {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.USER_ADDRESS_TABLE).doc(addressId).delete();
  }

  editAddress(address: Address) {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.USER_ADDRESS_TABLE).doc(address.id).update(address);
  }

  

  evictCartList() {
    return this.firestore.collection(this.USER_TABLE).doc(this.getUserMobileNumber())
    .collection(this.CART_TABLE).get().toPromise().then(docs => {
      docs.forEach(doc => {
        if(doc.exists){
          doc.ref.delete();
        }
      })
    })
  }
  getUserMobileNumber(): string {
    let user : User = this.local.getObject(LocalStoreObjectService.USER_KEY);
    if(user){
      return user.mobileNumber;
    }
  }

  getOrdersOrReturn(order:boolean) :Promise<firebase.firestore.QuerySnapshot<unknown>>{
    return this.firestore.collection(order?this.ORDER_TABLE:this.RETURN_TABLE, ref => ref.where("mobileNumber","==",this.getUserMobileNumber())
    .orderBy("placedDate",'desc')).get().toPromise();
  }
  getAllOrdersReturnBilling(tableName:string){
    return this.firestore.collection(tableName).get().toPromise();
  }

  getAllOrdersReturnBillingByDate(tableName:string,date : string){
    return this.firestore.collection(tableName,ref => ref.where("placedDate",">",date)).get().toPromise();
  }

  getOrderDetails(tableName:string,orderId: string) : Promise<firebase.firestore.DocumentSnapshot<unknown>>{
    return this.firestore.collection(tableName).doc(orderId).get().toPromise();
  }

  cancelOrderOrRefund(tableName: string, id: string) :Promise<void> {
    return this.firestore.collection(tableName).doc(id).update({
      orderStatusList: firebase.firestore.FieldValue.arrayUnion({
        orderStatus : 'CANCELLED',
        date : new Date().toISOString()
      }),
      currentOrderStatus : 'CANCELLED'
    });
  }

  placeReturn(returnOrder: Order) :Promise<DocumentReference<unknown>>{
    return this.firestore.collection(this.RETURN_TABLE).add(returnOrder);
  }

  placeOrder(cart: Order) : Promise<DocumentReference<unknown>>{
    return this.firestore.collection(this.ORDER_TABLE).add(cart);
  }



  saveCategoriesToDb(mainCategoryList: Array<MainCategory>) {
    return Promise.all(mainCategoryList.map(c => {
      if(c.id.startsWith("NEW_")){
        return this.firestore.collection(this.CATEGORY_TABLE).add(c).then(re=>{
          return re.id;
        });
      }
      return this.firestore.collection(this.CATEGORY_TABLE).doc(c.id).update(c).then(()=>{
        return c.id;
      });
    }));
  }

  getAllPincodes() {
    return this.firestore.collection(this.PINCODE_TABLE).get().toPromise();
  }

  addNewPincode(result: PinCode) {
    return this.firestore.collection(this.PINCODE_TABLE).doc(result.pincode).set(result);
  }

  editPincode(result: PinCode) {
    return this.firestore.collection(this.PINCODE_TABLE).doc(result.pincode).update(result);
  }
  deletePincode(result: PinCode) {
    return this.firestore.collection(this.PINCODE_TABLE).doc(result.pincode).delete();
  }

  updateActiveStatePincode(result: PinCode) {
    return this.firestore.collection(this.PINCODE_TABLE).doc(result.pincode).update({
      available : result.available
    })
  }

  getOrderByStatusCount(status : string){
    return this.firestore.collection(this.ORDER_TABLE).get().toPromise().then(snap=>{
      return snap.size;
    })
  }

  getAllOrders(tableName : string,status : string,lastDocument : DocumentSnapshot<any>,pageLimit:number,isNext : boolean,isReload : boolean) {
    return this.firestore.collection(tableName ,ref => 
      {
        let newRef = ref.orderBy("placedDate",'desc');
        if(status){
          newRef = newRef.where("currentOrderStatus","==",status.toUpperCase());
        }
        if(lastDocument){
          if(isReload){
            newRef.startAt(lastDocument)
          }else{
            newRef = isNext?newRef.startAfter(lastDocument):newRef.endBefore(lastDocument);
          }
        }
        newRef = isNext?newRef.limit(pageLimit):newRef.limitToLast(pageLimit);
        return newRef
      }).get().toPromise();
  }

  addOrderStatus(id: string, orderStatus: OrderStatus,tableName:string) {
    return this.firestore.collection(tableName).doc(id).update({
      orderStatusList : firebase.firestore.FieldValue.arrayUnion(orderStatus),
      currentOrderStatus : orderStatus.orderStatus
    })
  }
  
}
