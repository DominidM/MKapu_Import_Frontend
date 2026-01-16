import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearVenta } from './crear-venta';

describe('CrearVentas', () => {
  let component: CrearVenta;
  let fixture: ComponentFixture<CrearVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearVenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearVenta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
