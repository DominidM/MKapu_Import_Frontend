import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarDespacho } from './agregar-despacho';

describe('AgregarDespacho', () => {
  let component: AgregarDespacho;
  let fixture: ComponentFixture<AgregarDespacho>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarDespacho]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarDespacho);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
