import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamosListado } from './reclamos-listado';

describe('ReclamosListado', () => {
  let component: ReclamosListado;
  let fixture: ComponentFixture<ReclamosListado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamosListado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamosListado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
