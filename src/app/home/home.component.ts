import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HomeItems, MainOffer } from 'src/bean/offer';
import { OfferService } from '../services/offer.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  mainOfferList : Array<MainOffer> = [];
  homeItemList : Array<HomeItems> = [];


  constructor(offerService : OfferService,
    private ngxService: NgxUiLoaderService) { 
    window.scroll(0,0);
    this.ngxService.start();
    offerService.getMainOfferList().then(mainOffers =>{
      this.mainOfferList = mainOffers.docs.map(mainOfferDoc => {
        let mainOffer = mainOfferDoc.data() as MainOffer;
        mainOffer.id = mainOfferDoc.id;
        return mainOffer;
      }).filter(o=>!o.hide);
      this.ngxService.stop();
    });

    offerService.getHomePageItems().then(homeItems => {
      this.homeItemList = homeItems;
      this.homeItemList = this.homeItemList.filter(h=>!h.hide).map(h=>{
        if(h.items && h.items.length>0){
          h.items = h.items.filter(s=>!s.hide);
        }
        return h;
      })
    });
  }

  ngOnInit(): void {

  }

  getDivision(pageCount){
    switch(pageCount){
      case 1 : return 'col-md-12';
      case 2 : return 'col-md-6';
      case 3 : return 'col-md-4';
      case 4 : return 'col-md-3';
      case 5 : return 'col-md-2';
      case 6 : return 'col-md-2';
    }
    return 'col-md-12';
  }

}
