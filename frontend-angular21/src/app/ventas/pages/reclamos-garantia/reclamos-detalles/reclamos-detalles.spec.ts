import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamosDetalles } from './reclamos-detalles';

describe('ReclamosDetalles', () => {
  let component: ReclamosDetalles;
  let fixture: ComponentFixture<ReclamosDetalles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamosDetalles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamosDetalles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
