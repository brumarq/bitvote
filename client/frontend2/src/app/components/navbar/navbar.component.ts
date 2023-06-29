import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(public authService: AuthService, public router: Router) { }

  ngOnInit() {
  }

  isLoggedIn() {
    return this.authService.currentUser != null;
  }

  get username() {
    return this.authService.currentUser.id;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
