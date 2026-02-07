import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamosEditar } from './reclamos-editar';

describe('ReclamosEditar', () => {
  let component: ReclamosEditar;
  let fixture: ComponentFixture<ReclamosEditar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamosEditar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamosEditar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
