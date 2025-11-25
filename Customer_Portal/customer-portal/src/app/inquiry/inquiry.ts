import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inquiry',
  standalone: true,
  templateUrl: './inquiry.html',
  styleUrls: ['./inquiry.css'],
  imports: [CommonModule, FormsModule]
})
export class Inquiry {
  inquiries: any[] = [];
  filteredInquiries: any[] = [];
  loading = true;
  error = '';

  // Individual filters for each column
  filters: any = {
    VBELN: '',
    ERDAT: '',
    MATNR: '',
    ARKTX: '',
    KWMENG: '',
    MEINS: '',
    WAERK: '',
    NETWR: ''
  };

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getInquiry().subscribe({
      next: (data: any[]) => {
        this.inquiries = data;
        this.filteredInquiries = [...data];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load inquiries';
        this.loading = false;
      }
    });
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredInquiries.sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      if (valA == null) return 1;
      if (valB == null) return -1;

      const strA = valA.toString();
      const strB = valB.toString();
      const numA = parseFloat(strA);
      const numB = parseFloat(strB);
      const isNumA = !isNaN(numA);
      const isNumB = !isNaN(numB);

      if (isNumA && isNumB) {
        return this.sortDirection === 'asc' ? numA - numB : numB - numA;
      } else if (isNumA !== isNumB) {
        return this.sortDirection === 'asc' ? (isNumA ? -1 : 1) : (isNumA ? 1 : -1);
      } else {
        return this.sortDirection === 'asc'
          ? strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' })
          : strB.localeCompare(strA, undefined, { numeric: true, sensitivity: 'base' });
      }
    });
  }

  applyFilters() {
    this.filteredInquiries = this.inquiries.filter(item =>
      Object.keys(this.filters).every(col => {
        const filterValue = this.filters[col].toLowerCase();
        return !filterValue || (item[col] && item[col].toString().toLowerCase().includes(filterValue));
      })
    );

    if (this.sortColumn) {
      this.sortData(this.sortColumn);
    }
  }
}
