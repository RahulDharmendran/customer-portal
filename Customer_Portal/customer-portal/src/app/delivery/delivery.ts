import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-delivery',
  standalone: true,
  templateUrl: './delivery.html',
  styleUrls: ['./delivery.css'],
  imports: [CommonModule, FormsModule]
})
export class Delivery {   // ⚠️ This name must match your import
  deliveries: any[] = [];
  filteredDeliveries: any[] = [];
  loading = true;
  error = '';

  filters: { [key: string]: string } = {};
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getDelivery().subscribe({
      next: (data: any[]) => {
        this.deliveries = [...data];
        this.filteredDeliveries = [...data];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load delivery data';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredDeliveries = this.deliveries.filter(item =>
      Object.keys(this.filters).every(col => {
        const filterVal = this.filters[col]?.toLowerCase();
        if (!filterVal) return true;
        const itemVal = item[col] ? item[col].toString().toLowerCase() : '';
        return itemVal.includes(filterVal);
      })
    );

    if (this.sortColumn) {
      this.sortData(this.sortColumn);
    }
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredDeliveries.sort((a, b) => {
      const valA = a[column] ?? '';
      const valB = b[column] ?? '';
      return this.sortDirection === 'asc'
        ? valA.toString().localeCompare(valB.toString(), undefined, { numeric: true, sensitivity: 'base' })
        : valB.toString().localeCompare(valA.toString(), undefined, { numeric: true, sensitivity: 'base' });
    });
  }
}
