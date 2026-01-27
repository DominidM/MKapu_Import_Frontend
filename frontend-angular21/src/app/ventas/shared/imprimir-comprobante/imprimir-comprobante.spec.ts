import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprimirComprobante } from './imprimir-comprobante';

describe('ImprimirComprobante', () => {
  let component: ImprimirComprobante;
  let fixture: ComponentFixture<ImprimirComprobante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImprimirComprobante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImprimirComprobante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
