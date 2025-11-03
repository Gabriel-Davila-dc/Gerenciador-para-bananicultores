import { Component, ElementRef, viewChild, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  menusMobile = 'menus-mobilenoshow';

  constructor() {}

  showMenu() {
    if (this.menusMobile == 'menus-mobilenoshow') {
      this.menusMobile = 'menus-mobile';
    } else {
      this.noShowMenu();
    }
  }
  noShowMenu() {
    this.menusMobile = 'menus-mobilenoshow';
  }
}
