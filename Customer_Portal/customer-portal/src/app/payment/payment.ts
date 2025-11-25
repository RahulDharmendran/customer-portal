import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Payment implements OnInit {
  customerId: string = '';
  payments: any[] = [];
  filteredPayments: any[] = []; // for filtering/sorting
  loading: boolean = false;
  error: string = '';

  filters = {
    document: '',
    invoiceDate: '',
    amount: '',
    currency: '',
    dueDate: '',
    aging: ''
  };

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.customerId = localStorage.getItem('customer_id') || '';
    this.fetchPayments();
  }

  fetchPayments() {
    if (!this.customerId) {
      this.error = 'Customer ID not found. Please login again.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.payments = [];

    this.authService.getPayments().subscribe({
      next: (res) => {
        this.payments = Array.isArray(res) ? res : [res];
        this.filteredPayments = [...this.payments];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch payment details';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters() {
    this.filteredPayments = this.payments.filter(p => 
      p.VBELN.toString().includes(this.filters.document) &&
      (p.FKDAT || '').includes(this.filters.invoiceDate) &&
      p.NETWR.toString().includes(this.filters.amount) &&
      (p.WAERK || '').includes(this.filters.currency) &&
      (p.DATS || '').includes(this.filters.dueDate) &&
      (p.AGING || '').includes(this.filters.aging)
    );
    if (this.sortColumn) this.sortData(this.sortColumn);
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredPayments.sort((a, b) => {
      let valA = a[column] || '';
      let valB = b[column] || '';

      if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
