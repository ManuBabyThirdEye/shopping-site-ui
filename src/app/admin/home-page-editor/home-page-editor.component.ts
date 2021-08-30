import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmBoxComponent } from 'src/app/app-modal/confirm-box/confirm-box.component';
import { OfferService } from 'src/app/services/offer.service';
import { HomeItems, HomeSubItem, MainOffer } from 'src/bean/offer';

@Component({
  selector: 'app-home-page-editor',
  templateUrl: './home-page-editor.component.html',
  styleUrls: ['./home-page-editor.component.scss']
})
export class HomePageEditorComponent implements OnInit {

  homeItemList : Array<HomeItems> = [];
  showInfo : boolean = true;
  mainOfferList : Array<MainOffer> = [];


  constructor(private offerService : OfferService,
    private ngxService: NgxUiLoaderService,
    private router: Router,
    private modalService: NgbModal) {
    window.scroll(0,0);
    this.getOffers();
    offerService.getMainOfferList().then(mainOffers =>{
      this.mainOfferList = mainOffers.docs.map(mainOfferDoc => {
        let mainOffer = mainOfferDoc.data() as MainOffer;
        mainOffer.id = mainOfferDoc.id;
        return mainOffer;
      });
      this.ngxService.stop();
    });
  }
  getOffers() {
    this.ngxService.start();
    this.offerService.getHomePageItems().then(homeItems => {
      this.homeItemList = homeItems;
      this.homeItemList.map(homeItem => {
        homeItem.editedHeading = homeItem.heading;
        homeItem.editedOrder = homeItem.order;
        return homeItem;
      })
      this.homeItemList.sort((i1,i2)=>{
        return i1.order-i2.order;
      })
      this.ngxService.stop();
    });
  }

  ngOnInit(): void {

  }

  saveHeading(homeItem : HomeItems){
    homeItem.edit=false;
    homeItem.heading = homeItem.editedHeading;
    homeItem.order = parseInt(homeItem.editedOrder+"");
    this.ngxService.start();
    if(homeItem.id.startsWith("dummy_")){
      this.offerService.addOffer(homeItem).then(res=>{
        this.ngxService.stop();
        this.getOffers();
      });
    }else{
      this.offerService.updateOfferNameAndOrder(homeItem).then(res=>{
        this.ngxService.stop();
        this.homeItemList.sort((i1,i2)=>{
          return i1.order-i2.order;
        })
      });
    }

  }

  cancelHeading(homeItem : HomeItems){
    if(homeItem.id.startsWith("dummy_")){
     let index = this.homeItemList.findIndex(f=>f.id==homeItem.id);
     if(index!=-1){
      this.homeItemList.splice(index,1);
     }
    }else{
      homeItem.edit=false;
      homeItem.editedHeading = homeItem.heading;
      homeItem.editedOrder = homeItem.order;
    }
  }


  editSubOffer(homeItem : HomeItems,item:HomeSubItem){
    if(item){
      this.router.navigate(['/admin/offer-editor'],{queryParams : {offerId:homeItem.id,offerType:'sub',subOfferId:item?item.id:undefined}})
    } else {
      this.router.navigate(['/admin/offer-editor'],{queryParams : {offerId:homeItem.id,offerType:'sub'}})
    }
  }

  deleteOffer(homeItem : HomeItems){
    const confirmDeleteAddress = this.modalService.open(ConfirmBoxComponent);
    confirmDeleteAddress.componentInstance.image = "../../assets/offer.png";
    confirmDeleteAddress.componentInstance.heading = "Delete Offer";
    confirmDeleteAddress.componentInstance.details = "We can not retrive once deleted, are you sure?";
    confirmDeleteAddress.componentInstance.positiveText = "DELETE";
    confirmDeleteAddress.componentInstance.negativeText = "CANCEL";

    confirmDeleteAddress.result.then(result=>{
      if(result){
        this.ngxService.start();
        this.offerService.deleteOffer(homeItem.id).then(()=>{
          let index = this.homeItemList.findIndex(o=>o.id==homeItem.id);
          if(index!=-1){
            this.homeItemList.splice(index,1);
          }
          this.ngxService.stop();
        })
      }
    }).catch(e=>{

    })

  }

  deleteSubOffer(homeItem : HomeItems,item:HomeSubItem){
    const confirmDeleteAddress = this.modalService.open(ConfirmBoxComponent);
    confirmDeleteAddress.componentInstance.image = "../../assets/offer.png";
    confirmDeleteAddress.componentInstance.heading = "Delete Sub Offer";
    confirmDeleteAddress.componentInstance.details = "We can not retrive once deleted, are you sure?";
    confirmDeleteAddress.componentInstance.positiveText = "DELETE";
    confirmDeleteAddress.componentInstance.negativeText = "CANCEL";

    confirmDeleteAddress.result.then(result=>{
      if(result){
        this.ngxService.start();
        this.offerService.deleteSubOffer(homeItem.id,item.id).then(()=>{
          let offer = this.homeItemList.find(o=>o.id==homeItem.id);
          let index = offer.items.findIndex(o=>o.id==item.id);
          if(index!=-1){
            offer.items.splice(index,1);
          }
          this.ngxService.stop();
        })
      }
    }).catch(e=>{

    })

  }

  hideOrUnhideOffer(homeItem : HomeItems){
    this.ngxService.start();
    this.offerService.hideOrUnhideOffer(homeItem.id,!homeItem.hide).then(()=>{
      homeItem.hide = !homeItem.hide;
      this.ngxService.stop();
    })
  }

  hideOrUnhideSubOffer(homeItem : HomeItems,item:HomeSubItem){
    this.ngxService.start();
    this.offerService.hideOrUnhideSubOffer(homeItem.id,item.id,!item.hide).then(()=>{
      let offer = this.homeItemList.find(o=>o.id==homeItem.id);
      let index = offer.items.find(o=>o.id==item.id).hide = !item.hide;
      this.ngxService.stop();
    })
  }

  addMoreOffer(){
    this.homeItemList.push({
      edit:true,
      editedHeading:"",
      editedOrder:undefined,
      heading:"",
      id:"dummy_"+new Date().getMilliseconds(),
      items : [],
      order : undefined,
      hide : false
    })
  }

  deleteMainOffer(mainOffer : MainOffer){
    const confirmDeleteAddress = this.modalService.open(ConfirmBoxComponent);
    confirmDeleteAddress.componentInstance.image = "../../assets/offer.png";
    confirmDeleteAddress.componentInstance.heading = "Delete Main Offer";
    confirmDeleteAddress.componentInstance.details = "We can not retrive once deleted, are you sure?";
    confirmDeleteAddress.componentInstance.positiveText = "DELETE";
    confirmDeleteAddress.componentInstance.negativeText = "CANCEL";

    confirmDeleteAddress.result.then(result=>{
      if(result){
        this.ngxService.start();
        this.offerService.deleteMainOffer(mainOffer).then(()=>{
          let index = this.mainOfferList.findIndex(o=>o.id==mainOffer.id);
          if(index!=-1){
            this.mainOfferList.splice(index,1);
          }
          this.ngxService.stop();
        })
      }
    }).catch(e=>{

    })

  }
  hideOrUnhideMainOffer(mainOffer : MainOffer){
    mainOffer.hide = mainOffer.hide?true:false;
    this.ngxService.start();
    this.offerService.hideOrUnhideMainOffer(mainOffer).then(()=>{
      mainOffer.hide = !mainOffer.hide;
      this.ngxService.stop();
    })
  }

  editMainOffer(mainOffer : MainOffer){
    if(mainOffer){
      this.router.navigate(['/admin/offer-editor'],{queryParams : {offerId:mainOffer.id,offerType:'main'}})
    } else {
      this.router.navigate(['/admin/offer-editor'],{queryParams : {offerType:'main'}})
    }
  }
}
