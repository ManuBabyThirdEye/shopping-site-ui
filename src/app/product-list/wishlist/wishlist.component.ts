import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { Product, WishItem } from 'src/bean/category';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {

  wishList : Array<WishItem> = [];

  constructor(private categoryService: CategoryService,
    private ngxService: NgxUiLoaderService) { 
      window.scroll(0,0);
    }

  ngOnInit(): void {
    this.ngxService.start();
    this.categoryService.getWishListSnapshot().subscribe(wishList=>{
      this.wishList = wishList.map(e => {
        let item = e.payload.doc.data() as WishItem;
        item.id = e.payload.doc.id;
        return item;
      });
      this.ngxService.stop();
      console.log(this.wishList)
    })
  }

  removeFromWishList(productId:string){
    this.categoryService.removeFromWishList(productId).then(()=>{
      console.log("Done");
    }).catch(e => {
      console.log("error");
      console.log(e);
    });
    event.stopPropagation()
  }

}
