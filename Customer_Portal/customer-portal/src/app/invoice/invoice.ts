import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice',
  standalone: true,
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.css'],
  imports: [CommonModule, FormsModule]
})
export class Invoice {
  
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  loading = true;
  error = '';

  // Individual filters
  filters: any = {
    VBELN: '',
    FKDAT: '',
    KUNAG: '',
    WAERK: '',
    NETWR: ''
  };

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getInvoices().subscribe({
      next: (data: any[]) => {
        this.invoices = data;
        this.filteredInvoices = [...data];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load invoices';
        this.loading = false;
      }
    });
  }

  filterTable() {
    this.filteredInvoices = this.invoices.filter(item =>
      Object.keys(this.filters).every(key =>
        String(item[key] ?? '')
          .toLowerCase()
          .includes(this.filters[key].toLowerCase())
      )
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

    this.filteredInvoices.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (valueA == null) return 1;
      if (valueB == null) return -1;

      const numA = parseFloat(valueA.toString());
      const numB = parseFloat(valueB.toString());
      const isNumA = !isNaN(numA);
      const isNumB = !isNaN(numB);

      if (isNumA && isNumB) {
        return this.sortDirection === 'asc' ? numA - numB : numB - numA;
      } else {
        return this.sortDirection === 'asc'
          ? valueA.toString().localeCompare(valueB.toString())
          : valueB.toString().localeCompare(valueA.toString());
      }
    });
  }

  getSortIcon(col: string) {
    if (this.sortColumn !== col) return '';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  downloadPDF(vbeln: string) {
    this.authService.getInvoicePDF(vbeln).subscribe({
      next: (file: Blob) => {
        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${vbeln}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error = 'PDF download failed';
      }
    });
  }
}
