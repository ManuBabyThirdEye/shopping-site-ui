import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { Category, CategoryMap, MainCategory, User } from "../../bean/category";
import { ConfirmBoxComponent } from '../app-modal/confirm-box/confirm-box.component';
import { AuthService } from '../services/auth.service';
import { CategoryService } from "../services/category.service";
import { LocalStoreObjectService } from '../services/local-store-object.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  showDropDown : boolean = false;
  onDropDownMenu : boolean = false;
  onDropDown : boolean = false;
  currentDropDownItem : string;
  currentMainCategory : MainCategory;
  showProfileDropDown : boolean = false;
  mainCategorList : Array<MainCategory> = [];
  user :User = undefined;
  showMenu : boolean = false;
  showMore : boolean = false;
  showBack : boolean = false;
  searchKey : string;
  categorySearchMap : Map<string,CategoryMap> = new Map();
  categoryKeySearchMap : Map<string,string> = new Map();
  isLocal : boolean;
  icon : string;

  searchList : Array<string> = [];
  constructor(private categoryService : CategoryService,
    private authService: AuthService,
    private router: Router,
    private _location: Location,
    private modalService: NgbModal,
    private localStorageObject: LocalStoreObjectService) { 
      this.isLocal = environment.local;
      this.icon = "../../"+environment.icon;
    this.categoryService.getAllCategoryList().then(cList=>{
      this.mainCategorList = cList.docs.map(c=>{
        let mainCate : MainCategory =  c.data() as MainCategory;
          mainCate.id = c.id;
          return mainCate;
      })
      this.createCategorySearchMap(this.mainCategorList);
    })
    
  }
  createCategorySearchMap(mainCategorList: MainCategory[]) {
    mainCategorList.forEach(mainCat=>{
      mainCat.categories.forEach(cat => {
        this.categoryKeySearchMap.set(mainCat.name+" "+cat.name,cat.id);
        this.categorySearchMap.set(cat.id,{
          mainCategoryName : mainCat.name,
          categoryId : cat.id,
          categoryName : cat.name,
          subCategoryId : undefined,
          subCategoryName : undefined
        })
        if(cat.subCategories && cat.subCategories.length>0){
          cat.subCategories.forEach(subCat => {
            this.categoryKeySearchMap.set(mainCat.name+" "+cat.name+" "+subCat.name,subCat.id);
            this.categorySearchMap.set(subCat.id,{
              mainCategoryName : mainCat.name,
              categoryId : cat.id,
              categoryName : cat.name,
              subCategoryId : subCat.id,
              subCategoryName : subCat.name
            })
          })
        }
      })
    })
  }

  ngOnInit(): void {
    this.authService.signedIn.subscribe(user => {
      if(user!= null){
        this.authService.getUserFromFirestore(user.phoneNumber).then(u => {
          this.user = u.data() as User;
          this.user.mobileNumber = u.id;
          this.localStorageObject.setObject(LocalStoreObjectService.USER_KEY,this.user);
        })
      }else{
        this.user = undefined;
      }
    })
  }

  logout(){
    const confirmRemoveCart = this.modalService.open(ConfirmBoxComponent);
    confirmRemoveCart.componentInstance.image = "../../assets/hacker.png";
    confirmRemoveCart.componentInstance.heading = "Logout";
    confirmRemoveCart.componentInstance.details = "Are you sure you want to logout?";
    confirmRemoveCart.componentInstance.positiveText = "LOGOUT";
    confirmRemoveCart.componentInstance.negativeText = "CANCEL";

    confirmRemoveCart.result.then(result=>{
      if(result){
        this.authService.logout().then(response => {
          localStorage.removeItem(LocalStoreObjectService.USER_KEY);
          this.router.navigate(['']).then(r=>{
            window.location.reload();
          })
        });
      }
    }).catch(e=>{
      
    })
  }

  updateDropdown(item:string){
    if(this.currentDropDownItem == undefined || this.currentDropDownItem != item){
      this.currentDropDownItem = item;
      this.currentMainCategory = this.mainCategorList.find(c=>c.name.toLowerCase()==item.toLowerCase());
      this.showDropDown = true;
    }
    this.showProfileDropDown = false;
  }

  openCat(cat : Category, mainCat : MainCategory){
    if(cat.subCategories && cat.subCategories.length>0){
      cat.showSubCategories=!cat.showSubCategories;
      event.stopPropagation();
    }else{
      this.showMenu = false;
      this.router.navigate(['/product-list'],{queryParams : {mainCategory : mainCat.name,category:cat.name,categoryId:cat.id}});
    }
  }
  openMainCat(mainCat : MainCategory){
    mainCat.showCategories=!mainCat.showCategories;
    event.stopPropagation();
  }
  goBack(){
    this._location.back();
  }

  searchCategory(event){
    this.searchList = [];
    let searchKey : string = event.target.value;
    if(searchKey.length>1){
      this.categoryKeySearchMap.forEach((value,key)=>{
        if(key.toLowerCase().includes(searchKey.toLowerCase())){
          this.searchList.push(key);
        }
      })
    }
  }

  gotoProductList(key : string){
    let categoryMapObj : CategoryMap = this.categorySearchMap.get(this.categoryKeySearchMap.get(key));
    this.router.navigate(['/product-list'],{queryParams : {mainCategory : categoryMapObj.mainCategoryName,category:categoryMapObj.categoryName,
      categoryId:categoryMapObj.categoryId,subCategory:categoryMapObj.subCategoryName,subCategoryId:categoryMapObj.subCategoryId}});
    this.searchKey = "";
    this.searchList = [];
  }

}
