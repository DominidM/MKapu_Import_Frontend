import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarVenta } from './generar-venta';

describe('CrearVentas', () => {
  let component: GenerarVenta;
  let fixture: ComponentFixture<GenerarVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarVenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarVenta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
