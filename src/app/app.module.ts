import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CategoryListComponent } from './header/category-list/category-list.component';
import { LoginComponent } from './login/login.component';
import { OtpComponent } from './login/otp/otp.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-list/product-detail/product-detail.component';
import { WishlistComponent } from './product-list/wishlist/wishlist.component';
import { CartComponent } from './product-list/cart/cart.component';
import { SelectAddressComponent } from './product-list/select-address/select-address.component';
import { OrderComponent } from './order/order-list/order.component';
import { NgxUiLoaderConfig, NgxUiLoaderModule, PB_DIRECTION, SPINNER } from "ngx-ui-loader";
import { UserDetailsComponent } from './login/user-details/user-details.component';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddAddressComponent } from './app-modal/add-address/add-address.component';
import { OrderDetailsComponent } from './order/order-details/order-details.component';
import { SelectQuantityComponent } from './app-modal/select-quantity/select-quantity.component';
import { ConfirmBoxComponent } from './app-modal/confirm-box/confirm-box.component';
import { NoPrevilageComponent } from './admin/no-previlage/no-previlage.component';
import { AdminHomeComponent } from './admin/admin-home/admin-home.component';
import { UpdateCategoryListComponent } from './admin/update-category-list/update-category-list.component';
import { EditCategoryComponent } from './app-modal/edit-category/edit-category.component';
import { HomePageEditorComponent } from './admin/home-page-editor/home-page-editor.component';
import { SortPipe } from './pipe/sort.pipe';
import { OfferEditorComponent } from './admin/offer-editor/offer-editor.component';
import { ProductListEditComponent } from './admin/product-list-edit/product-list-edit.component';
import { ProductAddEditComponent } from './admin/product-add-edit/product-add-edit.component';
import { PincodeListComponent } from './admin/pincode-list/pincode-list.component';
import { AddPincodeComponent } from './app-modal/add-pincode/add-pincode.component';
import { AdminOrderListComponent } from './admin/admin-order-list/admin-order-list.component';
import { PickDateTimeComponent } from './app-modal/pick-date-time/pick-date-time.component';
import { ManageAdminComponent } from './admin/manage-admin/manage-admin.component';
import { GooglePayButtonComponent, GooglePayButtonModule } from '@google-pay/button-angular';
import { BillingComponent } from './admin/billing/billing.component';
import { PrintComponent } from './app-modal/print/print.component';
import { ProductDatailsComponent } from './app-modal/product-datails/product-datails.component';
import { SelectSizeComponent } from './app-modal/select-size/select-size.component';
import { ReportComponent } from './admin/report/report.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PickDateIntervalComponent } from './app-modal/pick-date-interval/pick-date-interval.component';
import { ScannerAnimComponent } from './admin/billing/scanner-anim/scanner-anim.component';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: "var(--theme-color)",
  fgsColor: "var(--theme-color)",
  bgsSize: 40,
  fgsSize: 100,
  blur: 5,
  pbColor: "var(--theme-color)",
  bgsType: SPINNER.threeStrings, // background spinner type
  fgsType: SPINNER.threeStrings, // foreground spinner type
  pbDirection: PB_DIRECTION.leftToRight, // progress bar direction
  pbThickness: 5, // progress bar thickness
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    CategoryListComponent,
    LoginComponent,
    OtpComponent,
    ProductListComponent,
    ProductDetailComponent,
    WishlistComponent,
    CartComponent,
    SelectAddressComponent,
    OrderComponent,
    UserDetailsComponent,
    AddAddressComponent,
    OrderDetailsComponent,
    SelectQuantityComponent,
    ConfirmBoxComponent,
    NoPrevilageComponent,
    AdminHomeComponent,
    UpdateCategoryListComponent,
    EditCategoryComponent,
    HomePageEditorComponent,
    SortPipe,
    OfferEditorComponent,
    ProductListEditComponent,
    ProductAddEditComponent,
    PincodeListComponent,
    AddPincodeComponent,
    AdminOrderListComponent,
    PickDateTimeComponent,
    ManageAdminComponent,
    BillingComponent,
    PrintComponent,
    ProductDatailsComponent,
    SelectSizeComponent,
    ReportComponent,
    PickDateIntervalComponent,
    ScannerAnimComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, 'rithum'),
    AngularFirestoreModule, 
    AngularFireAuthModule, 
    AngularFireStorageModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    ToastrModule.forRoot({
      positionClass: 'my-toast-top-center',
      preventDuplicates: true,
      easeTime : 300,
      timeOut: 2000
    }),
    NgbModule,
    GooglePayButtonModule,
    HighchartsChartModule,
    HttpClientModule, 
    AngularEditorModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
