import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AllSize, Order, Product, Size } from 'src/bean/category';
import firebase from "firebase/app";
import { UtilService } from '../services/util.service';
import { CategoryService } from './category.service';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  

  PRODUCT_TABLE : string = 'product';
  SIZE_TABLE : string = 'size';
  ORDER_TABLE : string = 'order';
  BILLING_TABLE : string = 'billing';



  constructor(private fireStorage : AngularFireStorage,
    private firestore : AngularFirestore,
    private utilService : UtilService,
    private categoryService : CategoryService) { }

  getProductList(categoryId: string,sortField:string, sortOption) :Promise<firebase.firestore.QuerySnapshot<unknown>> {
    return this.firestore.collection(this.PRODUCT_TABLE, ref => ref.where('category','array-contains',categoryId)
    .orderBy(sortField,sortOption)).get().toPromise();
  }

  async getAllProduct() {
    let products : Array<Product> =  await this.firestore.collection(this.PRODUCT_TABLE).get().toPromise().then(docs=>{
      return docs.docs.map(doc=>{
        let p = doc.data() as Product;
        p.id = doc.id;
        return p;
      })
    })
    for(let p of products ){
      p.availableSizes = await this.firestore.collection(this.PRODUCT_TABLE).doc(p.id)
      .collection(this.SIZE_TABLE).get().toPromise().then(sizes=>{
        if(sizes.size>0){
          return sizes.docs.map(s=>{
            return {
              count : s.get("count"),
              size : s.id
            };
          });
        }
      })
    }
    return products;
  }

  getProductCount(){
    return this.firestore.collection(this.PRODUCT_TABLE).get().toPromise().then(docs=>{
      return docs.size;
    })
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

  async reduceProductCountAndPlaceOrder(cart: Order,order:boolean) : Promise<string>{
    var batch = this.firestore.firestore.batch();
    let promiseList : Array<Promise<any>> = [];
    let cancel : boolean = false;
    cart.cartProducts.forEach(prod=>{
      if(cancel){
        return  Promise.reject(new Error());
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
    
      await Promise.all(promiseList);
      if(!cancel){
        await batch.commit();
        console.log(cart);
        return this.firestore.collection(order?this.ORDER_TABLE:this.BILLING_TABLE).add(cart).then(ref=>{
          return ref.id;
        });
      }else{
        return Promise.reject(new Error());
      }
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

  getProductRef(id: string): any {
    return this.firestore.collection(this.PRODUCT_TABLE).doc(id).ref;
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
    return this.utilService.getNextCounter(this.PRODUCT_TABLE).then(id=>{
      this.firestore.collection(this.PRODUCT_TABLE).doc(id+"").set(product).then(p=>{
        product.availableSizes.forEach(size=>{
          this.firestore.collection(this.PRODUCT_TABLE).doc(id+"").collection(this.SIZE_TABLE)
          .doc(size.size).set({
            count : size.count
          })
        })
        if(selectedImages){
          Promise.all(selectedImages.filter(f=>f).map(file=>{
            return this.uploadProductImage(file);
          })).then(r=>{
            product.images = r;
            r.forEach(url=>{
              this.firestore.collection(this.PRODUCT_TABLE).doc(id+"").update({
                images : firebase.firestore.FieldValue.arrayUnion(url)
              })
            });
          })
        }
      })
      return id;
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
        if(!this.utilService.isUrl(imgUrl)){
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

  getAvailableSizeFromProductId(id: string) {
    return this.firestore.collection(this.PRODUCT_TABLE).doc(id)
      .collection(this.SIZE_TABLE).get().toPromise().then(sizes=>{
            return sizes.docs.map(s=>{
              return {
                count : s.get("count"),
                size : s.id
              }
            })
            
    })
  }

  async getProductByName(productDetail: string) {
    let productList = await this.firestore.collection(this.PRODUCT_TABLE, ref=>ref.where("name","==",productDetail)).get().toPromise().then(docs=>{
      if(docs.size>0){
        return docs.docs.map(doc => {
          let prod = doc.data() as Product;
          prod.id = doc.id;
          return prod;
        })
      }
    });

    if(productList && productList.length>0){
      for(let i=0;i<productList.length;i++){
        productList[i].availableSizes = await this.firestore.collection(this.PRODUCT_TABLE).doc(productDetail)
        .collection(this.SIZE_TABLE).get().toPromise().then(docs=>{
          return docs.docs.map(doc => {
            let size : Size = doc.data() as Size;
            size.size = doc.id;
            return size;
          });
        })
      };
    }
    return productList;
  }
  async getProductById(productDetail: string) {
    let product = await this.firestore.collection(this.PRODUCT_TABLE).doc(productDetail).get().toPromise().then(doc=>{
      if(doc.exists){
        let prod = doc.data() as Product;
        prod.id = doc.id;
        return prod;
      }
    });
    if(product){
      product.availableSizes = await this.firestore.collection(this.PRODUCT_TABLE).doc(productDetail)
      .collection(this.SIZE_TABLE).get().toPromise().then(docs=>{
        return docs.docs.map(doc => {
          let size : Size = doc.data() as Size;
          size.size = doc.id;
          return size;
        });
      })
      return product;
    }
  }

  getDocSnapshotOfProduct(id : string){
    return this.firestore.collection(this.PRODUCT_TABLE).doc(id).get().toPromise();
  }

  async getAllProductWithPagination(lastDocument : DocumentSnapshot<any>,pageLimit:number) {
    let products : Array<Product> =  await  this.firestore.collection(this.PRODUCT_TABLE ,ref => 
      {
        let newRef = ref.limit(pageLimit);
        if(lastDocument){
          newRef = newRef.startAfter(lastDocument);
        }
        return newRef;
      }).get().toPromise().then(docs=>{
        return docs.docs.map(doc=>{
          let p = doc.data() as Product;
          p.id = doc.id;
          return p;
        })
      });

      for(let p of products ){
        p.availableSizes = await this.firestore.collection(this.PRODUCT_TABLE).doc(p.id)
        .collection(this.SIZE_TABLE).get().toPromise().then(sizes=>{
          if(sizes.size>0){
            return sizes.docs.map(s=>{
              return {
                count : s.get("count"),
                size : s.id
              };
            });
          }
        })
      }
      return products;
  }

}


