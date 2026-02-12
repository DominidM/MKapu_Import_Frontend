import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionListado } from './gestion-listado';

describe('GestionProductos', () => {
  let component: GestionListado;
  let fixture: ComponentFixture<GestionListado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionListado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionListado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
