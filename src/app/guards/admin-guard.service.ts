import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/bean/category';
import { CategoryService } from '../services/category.service';
import { LocalStoreObjectService } from '../services/local-store-object.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService  implements CanActivate{

  constructor(private localStoreObjectService : LocalStoreObjectService,private router: Router) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    let user : User =  this.localStoreObjectService.getObject(LocalStoreObjectService.USER_KEY);
    if(!user || !user.admin){
      this.router.navigateByUrl('/notauthorized')
    }
    return user && user.admin;
  }
}
