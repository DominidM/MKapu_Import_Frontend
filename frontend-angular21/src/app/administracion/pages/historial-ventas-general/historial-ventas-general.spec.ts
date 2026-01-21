import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialVentasGeneral } from './historial-ventas-general';

describe('HistorialVentasGeneral', () => {
  let component: HistorialVentasGeneral;
  let fixture: ComponentFixture<HistorialVentasGeneral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialVentasGeneral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialVentasGeneral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
