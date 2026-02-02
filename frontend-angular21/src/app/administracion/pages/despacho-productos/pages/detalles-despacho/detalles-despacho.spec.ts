import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesDespacho } from './detalles-despacho';

describe('DetallesDespacho', () => {
  let component: DetallesDespacho;
  let fixture: ComponentFixture<DetallesDespacho>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesDespacho]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesDespacho);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
