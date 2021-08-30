import { NgModule } from '@angular/core';
import { Routes, RouterModule, NoPreloading } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { OtpComponent } from './login/otp/otp.component';
import { UserDetailsComponent } from './login/user-details/user-details.component';
import { OrderDetailsComponent } from './order/order-details/order-details.component';
import { CartComponent } from './product-list/cart/cart.component';
import { OrderComponent } from './order/order-list/order.component';
import { ProductDetailComponent } from './product-list/product-detail/product-detail.component';
import { ProductListComponent } from './product-list/product-list.component';
import { SelectAddressComponent } from './product-list/select-address/select-address.component';
import { WishlistComponent } from './product-list/wishlist/wishlist.component';
import { NoPrevilageComponent } from './admin/no-previlage/no-previlage.component';
import { AdminHomeComponent } from './admin/admin-home/admin-home.component';
import { AdminGuardService } from './guards/admin-guard.service';
import { CategoryListComponent } from './header/category-list/category-list.component';
import { UpdateCategoryListComponent } from './admin/update-category-list/update-category-list.component';
import { HomePageEditorComponent } from './admin/home-page-editor/home-page-editor.component';
import { OfferEditorComponent } from './admin/offer-editor/offer-editor.component';
import { ProductListEditComponent } from './admin/product-list-edit/product-list-edit.component';
import { ProductAddEditComponent } from './admin/product-add-edit/product-add-edit.component';
import { PincodeListComponent } from './admin/pincode-list/pincode-list.component';
import { AdminOrderListComponent } from './admin/admin-order-list/admin-order-list.component';
import { ManageAdminComponent } from './admin/manage-admin/manage-admin.component';
import { BillingComponent } from './admin/billing/billing.component';
import { PrintComponent } from './app-modal/print/print.component';

const routes: Routes = [
  { path: '', component:  HomeComponent },
  { path: 'login', component:  LoginComponent },
  { path: 'otp', component:  OtpComponent },
  { path: 'user-details', component:  UserDetailsComponent },
  { path: 'product-list', component:  ProductListComponent },
  { path: 'product-details', component:  ProductDetailComponent },
  { path: 'wishlist', component:  WishlistComponent },
  { path: 'cart', component:  CartComponent },
  { path: 'select-address', component:  SelectAddressComponent },
  { path: 'order', component:  OrderComponent },
  { path: 'order-details', component:  OrderDetailsComponent },
  { path: 'admin', component:   AdminHomeComponent, canActivate : [AdminGuardService]},
  { path: 'admin/category-list', component:  UpdateCategoryListComponent, canActivate : [AdminGuardService]},
  { path: 'admin/home-page-editor', component:  HomePageEditorComponent, canActivate : [AdminGuardService]},
  { path: 'admin/offer-editor', component:  OfferEditorComponent, canActivate : [AdminGuardService]},
  { path: 'admin/product-list-edit', component:  ProductListEditComponent, canActivate : [AdminGuardService]},
  { path: 'admin/product-add-edit', component:  ProductAddEditComponent, canActivate : [AdminGuardService]},
  { path: 'admin/pincode-list', component:  PincodeListComponent, canActivate : [AdminGuardService]},
  { path: 'admin/order-list', component:  AdminOrderListComponent, canActivate : [AdminGuardService]},
  { path: 'admin/manage-admin', component:  ManageAdminComponent, canActivate : [AdminGuardService]},
  { path: 'admin/billing', component:  BillingComponent, canActivate : [AdminGuardService]},
  { path: 'admin/billing/print', component:  PrintComponent, canActivate : [AdminGuardService]},
  { path: 'notauthorized', component:  NoPrevilageComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
