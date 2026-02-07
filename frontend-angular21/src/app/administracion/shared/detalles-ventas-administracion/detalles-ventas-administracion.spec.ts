import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesVentasAdministracion } from './detalles-ventas-administracion';

describe('DetallesVentasAdministracion', () => {
  let component: DetallesVentasAdministracion;
  let fixture: ComponentFixture<DetallesVentasAdministracion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesVentasAdministracion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesVentasAdministracion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
