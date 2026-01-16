import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarCliente } from './buscar-cliente';

describe('BuscarCliente', () => {
  let component: BuscarCliente;
  let fixture: ComponentFixture<BuscarCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarCliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
