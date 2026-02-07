import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogStockSedes } from './dialog-stock-sedes';

describe('DialogStockSedes', () => {
  let component: DialogStockSedes;
  let fixture: ComponentFixture<DialogStockSedes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogStockSedes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogStockSedes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
