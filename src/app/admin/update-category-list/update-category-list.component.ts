import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EditCategoryComponent } from 'src/app/app-modal/edit-category/edit-category.component';
import { CategoryService } from 'src/app/services/category.service';
import { Category, MainCategory, SubCategory } from 'src/bean/category';

@Component({
  selector: 'app-update-category-list',
  templateUrl: './update-category-list.component.html',
  styleUrls: ['./update-category-list.component.scss']
})
export class UpdateCategoryListComponent implements OnInit {

  @ViewChild("catDiv") catDiv: ElementRef;

  mainCategoryList : Array<MainCategory> = [];
  catLineMargin : number;
  subCatLineMargin : number;
  isSingleClickCat : boolean;
  isSingleClickMainCat : boolean;
  showSubmit : boolean = false;

  constructor(private categoryService : CategoryService,
    private ngxService: NgxUiLoaderService,
    private modalService: NgbModal,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.categoryService.getAllCategoryList().then(catDoc=>{
      this.mainCategoryList = catDoc.docs.map(cat=>{
        let mainCate : MainCategory =  cat.data() as MainCategory;
        mainCate.id = cat.id;
        return mainCate;
      });
      this.ngxService.stop();
    })
  }

  getSelectedMainCat(){
    return this.mainCategoryList.find(c=>c.selected);
  }

  getSelectedCat(){
    let mainCat = this.getSelectedMainCat();
    if(mainCat){
      return mainCat.categories.find(c=>c.selected);
    }
  }

  selectMainCat(mainCat : MainCategory){
    this.isSingleClickMainCat = true;
        setTimeout(() => {
          if(this.isSingleClickMainCat){
            this.mainCategoryList.map(m=>{
              m.selected=false
              return m;
            })
            mainCat.selected=true
            if(this.catDiv){
              if(!mainCat.categories || mainCat.categories.length==0){
                this.subCatLineMargin = 0;
              }else{
                this.catLineMargin =this.catDiv.nativeElement.offsetWidth/((mainCat.categories.length+1)*2);
              }
            }
          }
        },250);
    
  }

  selectCat(cat:Category){
    this.isSingleClickCat = true;
        setTimeout(() => {
          if(this.isSingleClickCat){
            let mainCat = this.getSelectedMainCat();
            if(mainCat){
              mainCat.categories.map(m=>{
                m.selected=false
                return m;
              })
              cat.selected = true;
              if(this.catDiv){
                if(!cat.subCategories || cat.subCategories.length==0){
                  this.subCatLineMargin = 0;
                }else{
                  this.subCatLineMargin =this.catDiv.nativeElement.offsetWidth/((cat.subCategories.length+1)*2);
                }
              }
            }
          }
        }, 250);
    
  }

  addNewMainCat(){
    const editMainCat = this.modalService.open(EditCategoryComponent);
    editMainCat.componentInstance.heading = "ADD MAIN CATEGORY";
    editMainCat.componentInstance.showPage = true;
    editMainCat.componentInstance.pageLabel = "Total Page Count";
    editMainCat.result.then(result=>{
      if(result){
        this.mainCategoryList.push({
          id : "NEW_"+new Date().getMilliseconds()+"",
          name : result.name,
          order : parseInt(result.order),
          pageCount : parseInt(result.page),
          selected : false,
          showCategories : false,
          categories : []
        });
        this.showSubmit = true;
      }
    }).catch(e=>{

    });
  }
  addNewCat(){
    const editMainCat = this.modalService.open(EditCategoryComponent);
    editMainCat.componentInstance.heading = "ADD CATEGORY";
    editMainCat.componentInstance.showPage = true;
    editMainCat.componentInstance.pageLabel = "Page Number";
    editMainCat.result.then(result=>{
      if(result){
        this.mainCategoryList.find(c=>c.selected).categories.push({
          id : new Date().getMilliseconds()+"",
          name : result.name,
          order : parseInt(result.order),
          page : parseInt(result.page),
          selected : false,
          showSubCategories : false,
          subCategories : []
        });
        this.showSubmit = true;
      }
    }).catch(e=>{

    });

  }
  addNewSubCat(){
    const editMainCat = this.modalService.open(EditCategoryComponent);
    editMainCat.componentInstance.heading = "ADD SUB CATEGORY";
    editMainCat.componentInstance.showPage = false;
    editMainCat.result.then(result=>{
      if(result){
        this.mainCategoryList.find(c=>c.selected).categories.find(c=>c.selected).subCategories.push({
          id : new Date().getMilliseconds()+"",
          name : result.name,
          order : parseInt(result.order)
        });
        this.showSubmit = true;
      }
    }).catch(e=>{

    });
  }

  editMainCat(mainCat : MainCategory){
    this.isSingleClickMainCat = false;
    const editMainCat = this.modalService.open(EditCategoryComponent);
    editMainCat.componentInstance.category = {
      name : mainCat.name,
      order : mainCat.order,
      page : mainCat.pageCount
    };
    editMainCat.componentInstance.heading = "MAIN CATEGORY";
    editMainCat.componentInstance.showPage = true;
    editMainCat.componentInstance.pageLabel = "Total Page Count";
    editMainCat.result.then(result=>{
      if(result){
        this.mainCategoryList.find(c=>c.id == mainCat.id).name = result.name;
        this.mainCategoryList.find(c=>c.id == mainCat.id).order = parseInt(result.order);
        this.mainCategoryList.find(c=>c.id == mainCat.id).pageCount = parseInt(result.page);
      }else{
        let index = this.mainCategoryList.findIndex(c=>c.id == mainCat.id);
        if(index!=-1){
          this.mainCategoryList.splice(index,1);
        }
      }
      this.showSubmit = true;
    }).catch(e=>{

    });
  }

  editCat(cat:Category){
    this.isSingleClickCat = false;
    this.isSingleClickMainCat = false;
    const editMainCat = this.modalService.open(EditCategoryComponent);
    editMainCat.componentInstance.category = cat;
    editMainCat.componentInstance.heading = "CATEGORY";
    editMainCat.componentInstance.showPage = true;
    editMainCat.componentInstance.pageLabel = "Page Number";
    editMainCat.result.then(result=>{
      if(result){
        this.mainCategoryList.find(c=>c.selected).categories.find(c=>c.id == cat.id).name = result.name;
        this.mainCategoryList.find(c=>c.selected).categories.find(c=>c.id == cat.id).order = parseInt(result.order);
        this.mainCategoryList.find(c=>c.selected).categories.find(c=>c.id == cat.id).page = parseInt(result.page);
      }else{
        let index = this.mainCategoryList.find(c=>c.selected).categories.findIndex(c=>c.id == cat.id);
        if(index!=-1){
          this.mainCategoryList.find(c=>c.selected).categories.splice(index,1);
        }
      }
      this.showSubmit = true;
    }).catch(e=>{
      
    });
  }
  editSubCat(subCat : SubCategory){
    this.isSingleClickCat = false;
    this.isSingleClickMainCat = false;
    const editMainCat = this.modalService.open(EditCategoryComponent);
    editMainCat.componentInstance.category = {
      name : subCat.name,
      order : subCat.order
    };;
    editMainCat.componentInstance.heading = "SUB CATEGORY";
    editMainCat.componentInstance.showPage = false;
    editMainCat.result.then(result=>{
      if(result){
        this.mainCategoryList.find(c=>c.selected).categories.find(c=>c.selected).subCategories.find(c=>c.id==subCat.id).name = result.name;
        this.mainCategoryList.find(c=>c.selected).categories.find(c=>c.selected).subCategories.find(c=>c.id==subCat.id).order = parseInt(result.order);
      }else{
        let index = this.mainCategoryList.find(c=>c.selected).categories.find(c=>c.selected).subCategories.findIndex(c=>c.id == subCat.id);
        if(index!=-1){
          this.mainCategoryList.find(c=>c.selected).categories.find(c=>c.selected).subCategories.splice(index,1);
        }
      }
      this.showSubmit = true;
    }).catch(e=>{
      
    });
  }

  saveChangesToDb(){
    this.ngxService.start();
    this.categoryService.saveCategoriesToDb(this.mainCategoryList).then(()=>{
      this.ngxService.stop();
      this.toastr.success("Categories updated successfully");
      window.location.reload();
    }).catch(e=>{
      console.log(e)
      this.ngxService.stop();
      this.toastr.error("Unable to update categories, please try after sometime")
    })
  }

}
