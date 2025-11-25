import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialSheet } from './financial-sheet';

describe('FinancialSheet', () => {
  let component: FinancialSheet;
  let fixture: ComponentFixture<FinancialSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialSheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
