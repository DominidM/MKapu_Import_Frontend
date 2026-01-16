import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesVenta } from './detalles-venta';

describe('DetallesVentas', () => {
  let component: DetallesVenta;
  let fixture: ComponentFixture<DetallesVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesVenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesVenta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
