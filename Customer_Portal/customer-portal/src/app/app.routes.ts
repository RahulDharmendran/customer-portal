import { Routes } from '@angular/router';

import { LoginComponent } from './login/login';
import { Home } from './home/home';
import { Dashboard } from './dashboard/dashboard';
import { Profile } from './profile/profile';
import { FinancialSheet } from './financial-sheet/financial-sheet';
import { Inquiry } from './inquiry/inquiry';
import { Sales } from './sales/sales';
import { Delivery } from './delivery/delivery';
import { Invoice } from './invoice/invoice';
import { Payment } from './payment/payment';
import { OverallSales } from './overall-sales/overall-sales';
import { CreditDebit } from './credit-debit/credit-debit';

import { AuthGuard } from './auth-guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login page
  { path: 'login', component: LoginComponent },

  // Home as container for all protected routes
  {
    path: 'home',
    component: Home,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'profile', component: Profile },
      { path: 'financial-sheet', component: FinancialSheet },
      { path: 'inquiry', component: Inquiry },
      { path: 'sales', component: Sales },
      { path: 'delivery', component: Delivery },
      { path: 'invoice', component: Invoice },
      { path: 'payment', component: Payment },
      { path: 'overall-sales', component: OverallSales },
      { path: 'credit-debit', component: CreditDebit },
      { path: '', redirectTo: 'home', pathMatch: 'full' } // default child page
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];
