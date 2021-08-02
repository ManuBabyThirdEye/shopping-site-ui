import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { HomeItems, HomeSubItem, MainOffer } from '../../bean/offer';


@Injectable({
  providedIn: 'root'
})
export class OfferService {
  
  MAIN_OFFER_TABLE : string = 'main-offer';
  HOME_PAGE_TABLE : string = 'home-page';
  OFFER_TABLE : string = 'offer';

  constructor(private firestore : AngularFirestore,private fireStorage : AngularFireStorage) { }

  getMainOfferList() : Promise<QuerySnapshot<any>> {
    return this.firestore.collection(this.MAIN_OFFER_TABLE,ref=>ref.orderBy("order")).get().toPromise();
  }

  getHomePageItems()  {
    let promiseList : Array<Promise<any>>; 
    return this.firestore.collection(this.HOME_PAGE_TABLE,ref=>ref.orderBy("order")).get().toPromise().then(res=>{
      return res.docs.map(o=>{
        let offer = o.data() as HomeItems;
        offer.id = o.id;
        this.getHomePageItemOffers(offer.id).then(offerList=>{
          offer.items = offerList;
        })
        return offer;
      })
    });
  }

  getHomePageItemOffers(homePageitemId : string){
    return this.firestore.collection(this.HOME_PAGE_TABLE).doc(homePageitemId).collection(this.OFFER_TABLE).get().toPromise().then(offRes=>{
      return offRes.docs.map(offerDoc=>{
        let offer = offerDoc.data() as HomeSubItem;
        offer.id = offerDoc.id;
        return offer;
      });
    })
  }

  getHomeSubOfferById(homePageitemId: string, homePageSubitemId: string) {
    return this.firestore.collection(this.HOME_PAGE_TABLE).doc(homePageitemId)
    .collection(this.OFFER_TABLE).doc(homePageSubitemId).get().toPromise();
  }
  

  updateOfferNameAndOrder(homeItem: HomeItems) {
    return this.firestore.collection(this.HOME_PAGE_TABLE).doc(homeItem.id).update({heading:homeItem.heading,order : homeItem.order});
  }

  deleteOffer(offerId:string) {
    return this.firestore.collection(this.HOME_PAGE_TABLE).doc(offerId).delete();
  }
  deleteSubOffer(id: string, subId: string) {
    return this.firestore.collection(this.HOME_PAGE_TABLE).doc(id)
    .collection(this.OFFER_TABLE).doc(subId).delete();
  }

  addOffer(homeItem: HomeItems) {
    return this.firestore.collection(this.HOME_PAGE_TABLE).add(homeItem);
  }

  hideOrUnhideSubOffer(id: string, subId: string, hide: boolean) {
    return this.firestore.collection(this.HOME_PAGE_TABLE).doc(id)
    .collection(this.OFFER_TABLE).doc(subId).update({hide:hide})
  }
  hideOrUnhideOffer(id: string, hide: boolean) {
    return this.firestore.collection(this.HOME_PAGE_TABLE).doc(id).update({hide:hide})
  }

  updateSubOfferOrder(offerId:string,subOffer: HomeSubItem) {
    return this.firestore.collection(this.HOME_PAGE_TABLE).doc(offerId)
    .collection(this.OFFER_TABLE).doc(subOffer.id).update({order:subOffer.order})
  }

  addSubOffer(offerId:string,subOffer: HomeSubItem) {
    return this.firestore.collection(this.HOME_PAGE_TABLE).doc(offerId)
    .collection(this.OFFER_TABLE).add(subOffer);
  }

  updateSubOfferImageUrl(offerId: string, subOfferid: string,url : string){
    return this.firestore.collection(this.HOME_PAGE_TABLE).doc(offerId)
    .collection(this.OFFER_TABLE).doc(subOfferid).update({image:url})
  }

  uploadSubOfferImage(offerId: string, subOfferid: string, file: any) {
    let timestamp = new Date().getMilliseconds();
    let ref = this.fireStorage.ref("main-page/"+timestamp+file.name);
    let task = ref.put(file);
    return task.then(resp=>{
      return ref.getDownloadURL().toPromise().then(url=>{
        console.log(url);
        this.updateSubOfferImageUrl(offerId,subOfferid,url);
        return url;
      })
    })
  }

  hideOrUnhideMainOffer(mainOffer: MainOffer) {
    return this.firestore.collection(this.MAIN_OFFER_TABLE).doc(mainOffer.id).update({hide:!mainOffer.hide})
  }
  deleteMainOffer(mainOffer: MainOffer) {
    return this.firestore.collection(this.MAIN_OFFER_TABLE).doc(mainOffer.id).delete();
  }

  getHomeMainOfferById(offerId: string) {
    return this.firestore.collection(this.MAIN_OFFER_TABLE).doc(offerId).get().toPromise();
  }

  uploadMainOfferImage(offerId: string, file: any) {
    let timestamp = new Date().getMilliseconds();
    let ref = this.fireStorage.ref("main-offer/"+timestamp+file.name);
    let task = ref.put(file);
    return task.then(resp=>{
      return ref.getDownloadURL().toPromise().then(url=>{
        this.updateMainOfferImageUrl(offerId,url);
        return url;
      })
    })
  }
  updateMainOfferImageUrl(offerId: any, url: any) {
    return this.firestore.collection(this.MAIN_OFFER_TABLE).doc(offerId).update({image:url});
  }
  addMainOffer(subOffer: HomeSubItem) {
    return this.firestore.collection(this.MAIN_OFFER_TABLE).add(subOffer);
  }
  updateMainOfferOrder(offerId: string, subOffer: HomeSubItem) {
    return this.firestore.collection(this.MAIN_OFFER_TABLE).doc(offerId).update({order:subOffer.order});
  }
}
