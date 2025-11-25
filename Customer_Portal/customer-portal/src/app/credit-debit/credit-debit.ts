import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-credit-debit',
  templateUrl: './credit-debit.html',
  styleUrls: ['./credit-debit.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreditDebit implements OnInit {
  customerId: string = '';
  memos: any[] = [];
  filteredMemos: any[] = [];
  loading: boolean = false;
  error: string = '';

  // Filtering fields
  filterVBELN: string = '';
  filterFKDAT: string = '';
  filterNETWR: string = '';
  filterWAERK: string = '';
  filterMEMO_TYPE: string = '';

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.customerId = localStorage.getItem('customer_id') || '';
    this.fetchMemos();
  }

  fetchMemos() {
    if (!this.customerId) {
      this.error = 'Customer ID not found. Please login again.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.memos = [];
    this.filteredMemos = [];

    this.authService.getCreditDebit().subscribe({
      next: (res) => {
        this.memos = Array.isArray(res) ? res : [res];
        this.filteredMemos = [...this.memos];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch credit-debit details';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters() {
    this.filteredMemos = this.memos.filter(item =>
      (!this.filterVBELN || item.VBELN?.includes(this.filterVBELN)) &&
      (!this.filterFKDAT || item.FKDAT?.includes(this.filterFKDAT)) &&
      (!this.filterNETWR || item.NETWR?.toString().includes(this.filterNETWR)) &&
      (!this.filterWAERK || item.WAERK?.includes(this.filterWAERK)) &&
      (!this.filterMEMO_TYPE || item.MEMO_TYPE?.toLowerCase().includes(this.filterMEMO_TYPE.toLowerCase()))
    );
    this.sortData(this.sortColumn, false);
  }

  sortData(column: string, toggle: boolean = true) {
    if (toggle) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    }

    if (!column) return;

    this.filteredMemos.sort((a, b) => {
      const valA = a[column] || '';
      const valB = b[column] || '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
