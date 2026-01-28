import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprimirComprobanteAdministracion } from './imprimir-comprobante-administracion';

describe('ImprimirComprobanteAdministracion', () => {
  let component: ImprimirComprobanteAdministracion;
  let fixture: ComponentFixture<ImprimirComprobanteAdministracion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImprimirComprobanteAdministracion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImprimirComprobanteAdministracion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
