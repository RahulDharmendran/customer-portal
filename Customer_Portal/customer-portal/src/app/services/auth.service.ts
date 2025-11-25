import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = "http://localhost:3000";  // Base Node.js backend URL

  private loginUrl = `${this.baseUrl}/login`;
  private profileUrl = `${this.baseUrl}/profile`;
  private inquiryUrl = `${this.baseUrl}/inquiry`;
  private salesUrl = `${this.baseUrl}/sales`;
  private deliveryUrl = `${this.baseUrl}/delivery`;
  private paymentUrl = `${this.baseUrl}/payment`;
  private overallSalesUrl = `${this.baseUrl}/overall-sales`;
  private creditDebitUrl = `${this.baseUrl}/credit-debit`;

  // ---------- Invoice Endpoints ----------
  private invoiceUrl = `${this.baseUrl}/invoice`;            // Invoice summary list
  private invoiceFormUrl = `${this.baseUrl}/invoice-form`;   // Invoice PDF download

  constructor(private http: HttpClient) {}

  // ---------- Authentication ----------
  login(credentials: any): Observable<any> {
    return this.http.post<any>(this.loginUrl, credentials);
  }

  // ---------- Customer Based APIs ----------
  getProfile(): Observable<any> {
    const customer_id = localStorage.getItem("customer_id");
    return this.http.post<any>(this.profileUrl, { customer_id });
  }

  getInquiry(): Observable<any[]> {
    const customer_id = localStorage.getItem("customer_id");
    return this.http.post<any[]>(this.inquiryUrl, { customer_id });
  }

  getSales(): Observable<any[]> {
    const customer_id = localStorage.getItem("customer_id");
    return this.http.post<any[]>(this.salesUrl, { customer_id });
  }

  getDelivery(): Observable<any[]> {
    const customer_id = localStorage.getItem("customer_id");
    return this.http.post<any[]>(this.deliveryUrl, { customer_id });
  }

  getPayments(): Observable<any[]> {
    const customer_id = localStorage.getItem("customer_id");
    return this.http.post<any[]>(this.paymentUrl, { customer_id });
  }

  getOverallSales(): Observable<any[]> {
    const customer_id = localStorage.getItem("customer_id");
    return this.http.post<any[]>(this.overallSalesUrl, { customer_id });
  }

  getCreditDebit(): Observable<any[]> {
    const customer_id = localStorage.getItem("customer_id");
    return this.http.post<any[]>(this.creditDebitUrl, { customer_id });
  }

  // ---------- Invoice API ----------
  getInvoices(): Observable<any[]> {
    const customer_id = localStorage.getItem("customer_id");
    return this.http.post<any[]>(this.invoiceUrl, { customer_id });
  }

  // 🔥 Download Invoice PDF by VBELN
  getInvoicePDF(vbeln: string): Observable<Blob> {
    return this.http.post(this.invoiceFormUrl, { vbeln }, { responseType: 'blob' });
  }

}
