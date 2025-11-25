import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditDebit } from './credit-debit';

describe('CreditDebit', () => {
  let component: CreditDebit;
  let fixture: ComponentFixture<CreditDebit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditDebit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditDebit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
