import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ritham-ui';
  showGoUp : boolean = false;
  constructor(){
    this.scrollTop();
  }

  @HostListener('window:scroll', [])  
  onWindowScroll() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      this.showGoUp = true;
    }else{
      this.showGoUp = false;
    }
  }

  scrollTop(){
    window.scroll(0,0);
  }
}
