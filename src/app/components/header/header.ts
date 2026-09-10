import { Component, ElementRef, viewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  menusMobile = 'menus-mobilenoshow';
  logado = !!localStorage.getItem('token');

  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

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

  async sair() {
    this.noShowMenu();
    await this.userService.logout();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}
