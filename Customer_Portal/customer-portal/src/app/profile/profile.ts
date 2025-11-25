import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [CommonModule]
})
export class Profile {
  profile: any = null;
  loading = true;
  error = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    console.log("Fetching profile for customer_id:", localStorage.getItem("customer_id"));

    this.authService.getProfile().subscribe({
      next: (data) => {
        console.log("Profile response:", data);
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Profile API error:", err);
        this.error = 'Failed to load profile';
        this.loading = false;
      }
    });
  }
}
