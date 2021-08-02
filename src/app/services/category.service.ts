import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentData, DocumentReference, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Order, CartProduct, Product, Address, User, MainCategory, AllSize, Size } from 'src/bean/category';
import firebase from "firebase/app";
import { ToastrService } from 'ngx-toastr';
import { LocalStoreObjectService } from './local-store-object.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmBoxComponent } from '../app-modal/confirm-box/confirm-box.component';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  
  CATEGORY_TABLE : string = 'category';
  FILTER_TABLE : string = 'filter-category';
  PRODUCT_TABLE : string = 'product';
  USER_TABLE : string = 'user';
  USER_WISHLIST_TABLE : string = 'wishlist';
  USER_ADDRESS_TABLE : string = 'address';
  CART_TABLE : string = 'cart';
  PINCODE_TABLE : string = 'pincode';
  ORDER_TABLE : string = 'order';
  RETURN_TABLE : string = 'return';
  SIZE_TABLE : string = 'size';


  constructor(private firestore : AngularFirestore,
    private toastr: ToastrService,
    private local : LocalStoreObjectService,
    private fireStorage : AngularFireStorage,
    private modalService: NgbModal) { }

  getAllCategoryList() : Promise<QuerySnapshot<any>> {
    return this.firestore.collection(this.CATEGORY_TABLE, ref=>ref.orderBy("order")).get().toPromise();
  }

  getFilter(categoryId: string) : Promise<firebase.firestore.DocumentSnapshot<unknown>> {
    return this.firestore.collection(this.FILTER_TABLE).doc(categoryId).get().toPromise();
  }

  getProductList(categoryId: string,sortField:string, sortOption) :Promise<firebase.firestore.QuerySnapshot<unknown>> {
    return this.firestore.collection(this.PRODUCT_TABLE, ref => ref.where('category','array-contains',categoryId)
    .orderBy(sortField,sortOption)).get().toPromise();
  }

  getProduct(productId:string) : Promise<Product>{
    return this.firestore.collection(this.PRODUCT_TABLE).doc(productId).get().toPromise().then(prod=>{
      if(prod.exists){
        let product = prod.data() as Product;
        product.id = prod.id;
        product.availableSizes = [];
        return this.firestore.collection(this.PRODUCT_TABLE).doc(productId).collection(this.SIZE_TABLE).get().toPromise().then(sizes=>{
          if(sizes.size>0){
            sizes.docs.forEach(s=>{
              product.availableSizes.push({
                count : s.get("count"),
                size : s.id
              });
            });
          }
          return product;
        });
      }
    });
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
          productRef : this.firestore.collection(this.PRODUCT_TABLE).doc(product.id).ref
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
          return this.firestore.collection(this.PRODUCT_TABLE).doc(pro.id)
          .collection(this.SIZE_TABLE).get().toPromise().then(sizes=>{
            sizes.docs.forEach(s=>{
              cartProduct.product.availableSizes.push({
                count : s.get("count"),
                size : s.id
              });
            })
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

  getOrderDetails(order:boolean,orderId: string) : Promise<firebase.firestore.DocumentSnapshot<unknown>>{
    return this.firestore.collection(order?this.ORDER_TABLE:this.RETURN_TABLE).doc(orderId).get().toPromise();
  }

  cancelOrderOrRefund(order: boolean, id: string) :Promise<void> {
    return this.firestore.collection(order?this.ORDER_TABLE:this.RETURN_TABLE).doc(id).update({
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

  reduceProductCountAndPlaceOrder(cart: Order) {
    var batch = this.firestore.firestore.batch();
    let promiseList : Array<Promise<any>> = [];
    let cancel : boolean = false;
    
    cart.cartProducts.forEach(prod=>{
      if(cancel){
        return;
      }
      promiseList.push(this.firestore.collection(this.PRODUCT_TABLE).doc(prod.product.id)
      .collection(this.SIZE_TABLE).doc(prod.size).get().toPromise().then(doc=>{
        if(doc.exists){
          let count : number = doc.get('count');
          if(count<prod.quantity){
            cancel = true;
          }else{
            if(count-prod.quantity==0){
              batch.delete(this.firestore.firestore.collection(this.PRODUCT_TABLE).doc(prod.product.id).collection(this.SIZE_TABLE).doc(prod.size));
              batch.update(this.firestore.firestore.collection(this.PRODUCT_TABLE).doc(prod.product.id),{availableSizeString:this.removeSizeFromString(prod.product.availableSizeString,prod.size)});
            }else{
              batch.update(this.firestore.firestore.collection(this.PRODUCT_TABLE).doc(prod.product.id)
              .collection(this.SIZE_TABLE).doc(prod.size),{count:count-prod.quantity})
            }
          }
        }
      }));
    });
    
      return Promise.all(promiseList).then((r)=>{
        if(!cancel){
          return batch.commit().then(()=>{
            return this.placeOrder(cart);
          })
        }else{
          return Promise.reject(new Error());
        }
      });
    
  }

  updateProductCountAfterCancel(order: Order) {
    order.cartProducts.forEach(prod=>{
      this.firestore.collection(this.PRODUCT_TABLE).doc(prod.product.id)
      .collection(this.SIZE_TABLE).doc(prod.size).get().toPromise().then(doc=>{
        if(doc.exists){
          let count : number = doc.get('count');
          this.firestore.collection(this.PRODUCT_TABLE).doc(prod.product.id)
              .collection(this.SIZE_TABLE).doc(prod.size).update({count:count+prod.quantity});
          this.firestore.collection(this.PRODUCT_TABLE).doc(prod.product.id)
              .update({availableSizeString:this.addSizeInString(prod.product.availableSizeString,prod.size)})
        }else{
          this.firestore.collection(this.PRODUCT_TABLE).doc(prod.product.id)
          .collection(this.SIZE_TABLE).doc(prod.size).set({count:prod.quantity});
          this.firestore.collection(this.PRODUCT_TABLE).doc(prod.product.id)
          .update({availableSizeString:this.addSizeInString(prod.product.availableSizeString,prod.size)})
        }
      });
    })
  }
  addSizeInString(availableSizeString: string, size: string) {
    let sizes = availableSizeString.split(",");
    if(sizes.indexOf(size)!=-1){
      return availableSizeString;
    }else{
      sizes.push(size);
      let newSize : Array<string> = [];
      if(sizes.indexOf('S')!=-1){
        newSize.push('S');
      }
      if(sizes.indexOf('M')!=-1){
        newSize.push('M');
      }
      if(sizes.indexOf('L')!=-1){
        newSize.push('L');
      }
      if(sizes.indexOf('XL')!=-1){
        newSize.push('XL');
      }
      if(sizes.indexOf('XXL')!=-1){
        newSize.push('XXL');
      }
      if(sizes.indexOf('XXXL')!=-1){
        newSize.push('XXXL');
      }
      return newSize.toString();
    }
  }

  removeSizeFromString(availableSizeString: string, size: string) {
    let sizes = availableSizeString.split(",");
    let index = sizes.indexOf(size);
    if(index != -1){
      sizes.splice(index,1);
    }
    console.log(sizes)
    return sizes.toString();
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

  unlinkProduct(productId: string, subOfferId: string) {
    return this.firestore.collection(this.PRODUCT_TABLE).doc(productId).update({
      category : firebase.firestore.FieldValue.arrayRemove(subOfferId)
    });
  }

  linkProduct(productId: string, subOfferId: string) {
    return this.firestore.collection(this.PRODUCT_TABLE).doc(productId).update({
      category : firebase.firestore.FieldValue.arrayUnion(subOfferId)
    });
  }

  addNewProduct(product: Product, selectedImages: any[]) {
    delete product.id;
    delete product.isWishList;
    product.images = [];
    return this.firestore.collection(this.PRODUCT_TABLE).add(product).then(p=>{
      product.availableSizes.forEach(size=>{
        this.firestore.collection(this.PRODUCT_TABLE).doc(p.id).collection(this.SIZE_TABLE)
        .doc(size.size).set({
          count : size.count
        })
      })
      Promise.all(selectedImages.filter(f=>f).map(file=>{
        return this.uploadProductImage(file);
      })).then(r=>{
        product.images = r;
        r.forEach(url=>{
          this.firestore.collection(this.PRODUCT_TABLE).doc(p.id).update({
            images : firebase.firestore.FieldValue.arrayUnion(url)
          })
        });
      })
    })
  }

  uploadProductImage( file: any) {
    let timestamp = new Date().getMilliseconds();
    let ref = this.fireStorage.ref("products/"+timestamp+file.name);
    let task = ref.put(file);
    return task.then(resp=>{
      return ref.getDownloadURL().toPromise().then(url=>{
        return url;
      })
    })
  }

  updateProductDetails(product: Product, selectedImages: any[],oldImages: string[]) {
    let prodId = product.id;
    delete product.id;
    delete product.isWishList;
    return this.firestore.collection(this.PRODUCT_TABLE).doc(prodId).update({
      availableSizeString : product.availableSizeString,
      discountPrice : product.discountPrice,
      discount : product.discount,
      name : product.name,
      productDeliveryDelay : product.productDeliveryDelay,
      details : product.details
    }).then(r=>{
      let sizeCollection = this.firestore.collection(this.PRODUCT_TABLE).doc(prodId).collection(this.SIZE_TABLE);
      sizeCollection.get().toPromise().then(sDocz=>{
          let currentSize = sDocz.docs.map(d=>{
            let s = d.data() as Size;
            s.size = d.id;
            return s;
          });
          for (let size in AllSize) {
            let sizeNowIndex = product.availableSizes.findIndex(s=>s.size==size);
            let sizeDBIndex = currentSize.findIndex(s=>s.size==size);
            if(sizeNowIndex!=-1 && sizeDBIndex!=-1){
              sizeCollection.doc(size).update({count:product.availableSizes[sizeNowIndex].count});
            }else if(sizeNowIndex!=-1 && sizeDBIndex==-1){
              sizeCollection.doc(size).set({count:product.availableSizes[sizeNowIndex].count});
            }else if(sizeNowIndex==-1 && sizeDBIndex!=-1){
              sizeCollection.doc(size).delete();
            }
          }
          
      });
      let fileUploadPromises : Array<Promise<any>> = [];
      product.images.forEach((imgUrl,index)=>{
        if(!this.isUrl(imgUrl)){
          let file = selectedImages[index]
          let timestamp = new Date().getMilliseconds();
          let ref = this.fireStorage.ref("products/"+timestamp+file.name);
          let task = ref.put(file);
          fileUploadPromises.push(task.then(resp=>{
            return ref.getDownloadURL().toPromise().then(url=>{
              product.images[index] = url;
              this.fireStorage.refFromURL(oldImages[index]).delete();
              return url;
            })
          }));
        }
      })
      return Promise.all(fileUploadPromises).then(()=>{
        this.firestore.collection(this.PRODUCT_TABLE).doc(prodId).update({
          images:product.images
        });
      });
    })
  }

  isUrl(url:string){
    return url.startsWith("https://firebasestorage");
  }
  
}
