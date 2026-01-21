import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarVentaAdmin } from './generar-venta-admin';

describe('GenerarVentaAdmin', () => {
  let component: GenerarVentaAdmin;
  let fixture: ComponentFixture<GenerarVentaAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarVentaAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarVentaAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
