import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-financial-sheet',
  standalone: true,
  templateUrl: './financial-sheet.html',
  styleUrls: ['./financial-sheet.css'],
  imports: [CommonModule, RouterModule]
})
export class FinancialSheet {
  // No extra logic for now. You can add API calls if needed later
}
