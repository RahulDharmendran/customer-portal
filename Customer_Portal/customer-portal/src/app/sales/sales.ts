import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales',
  standalone: true,
  templateUrl: './sales.html',
  styleUrls: ['./sales.css'],
  imports: [CommonModule, FormsModule]
})
export class Sales {
  sales: any[] = [];
  filteredSales: any[] = [];
  loading = true;
  error = '';

  // Filters for each column
  filters: { [key: string]: string } = {};

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getSales().subscribe({
      next: (response: any[]) => {
        this.sales = response;
        this.filteredSales = [...response];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load sales data';
        this.loading = false;
      }
    });
  }

  // Sort logic
  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredSales.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];

      if (valA == null) return 1;
      if (valB == null) return -1;

      const strA = valA.toString();
      const strB = valB.toString();

      const numA = parseFloat(strA);
      const numB = parseFloat(strB);
      const isNumA = !isNaN(numA);
      const isNumB = !isNaN(numB);

      if (isNumA && isNumB) return this.sortDirection === 'asc' ? numA - numB : numB - numA;
      if (isNumA !== isNumB) return this.sortDirection === 'asc' ? (isNumA ? -1 : 1) : (isNumA ? 1 : -1);

      return this.sortDirection === 'asc'
        ? strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' })
        : strB.localeCompare(strA, undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  // Apply per-column filters
  applyFilters() {
    this.filteredSales = this.sales.filter(item => {
      return Object.keys(this.filters).every(col => {
        const filterVal = this.filters[col]?.toLowerCase();
        if (!filterVal) return true;
        const itemVal = item[col] ? item[col].toString().toLowerCase() : '';
        return itemVal.includes(filterVal);
      });
    });

    if (this.sortColumn) this.sortData(this.sortColumn);
  }
}
