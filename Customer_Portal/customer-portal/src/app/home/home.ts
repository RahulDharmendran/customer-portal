import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [CommonModule, RouterModule]
})
export class Home {

  constructor(public router: Router) {   // ← changed from private to public
    history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      history.pushState(null, '', window.location.href);
      this.router.navigate(['/login']);
    };
  }

  logout() {
  localStorage.removeItem('customer_token');

  // Navigate to login and replace history
  this.router.navigate(['/login'], { replaceUrl: true });
}

}
