import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

let newPageTitle = environment.appName; 
document.title = newPageTitle; 

const favicon = document.getElementById("favicon");
favicon.setAttribute("href", environment.icon);  

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
