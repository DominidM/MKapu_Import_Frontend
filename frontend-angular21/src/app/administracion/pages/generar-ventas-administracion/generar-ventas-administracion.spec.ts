import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarVentasAdministracion } from './generar-ventas-administracion';

describe('GenerarVentasAdministracion', () => {
  let component: GenerarVentasAdministracion;
  let fixture: ComponentFixture<GenerarVentasAdministracion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarVentasAdministracion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarVentasAdministracion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
