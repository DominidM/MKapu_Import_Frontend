import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamosCrear } from './reclamos-crear';

describe('ReclamosCrear', () => {
  let component: ReclamosCrear;
  let fixture: ComponentFixture<ReclamosCrear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamosCrear]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamosCrear);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
