import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialVentasAdministracion } from './historial-ventas-administracion';

describe('HistorialVentasAdministracion', () => {
  let component: HistorialVentasAdministracion;
  let fixture: ComponentFixture<HistorialVentasAdministracion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialVentasAdministracion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialVentasAdministracion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
