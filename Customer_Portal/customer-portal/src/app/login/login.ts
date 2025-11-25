import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      customer_id: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.errorMessage = "Please enter Customer ID and Password";
      return;
    }

    const { customer_id, password } = this.loginForm.value;

    this.authService.login({ customer_id, password }).subscribe({
      next: (res: any) => {
        if (res.status === "LOGIN SUCCESS") {
          localStorage.setItem("customer_id", customer_id);
          localStorage.setItem("customer_token", "sample_token_123");

          this.router.navigate(['/home']);
        } else {
          this.errorMessage = res.status;
        }
      },
      error: () => {
        this.errorMessage = "Server Error. Try again.";
      }
    });
  }
}
