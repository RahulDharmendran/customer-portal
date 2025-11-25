import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-overall-sales',
  templateUrl: './overall-sales.html',
  styleUrls: ['./overall-sales.css'],
  standalone: true,
  imports: [CommonModule]
})
export class OverallSales implements OnInit {

  customerId: string = '';
  salesSummary: any = null; // single object
  loading: boolean = false;
  error: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.customerId = localStorage.getItem('customer_id') || '';
    this.fetchSalesSummary();
  }

  fetchSalesSummary() {
    if (!this.customerId) {
      this.error = 'Customer ID not found. Please login again.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.salesSummary = null;

    this.authService.getOverallSales().subscribe({
      next: (res) => {
        // res is expected as an array with a single item
        this.salesSummary = Array.isArray(res) ? res[0] : res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch overall sales';
        console.error(err);
        this.loading = false;
      }
    });
  }

}
