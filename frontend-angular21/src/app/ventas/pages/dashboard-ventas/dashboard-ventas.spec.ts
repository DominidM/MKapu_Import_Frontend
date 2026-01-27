import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVentas } from './dashboard-ventas';

describe('DashboardVentas', () => {
  let component: DashboardVentas;
  let fixture: ComponentFixture<DashboardVentas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardVentas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardVentas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
