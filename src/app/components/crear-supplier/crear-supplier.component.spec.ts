import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSupplierComponent } from './crear-supplier.component';

describe('CrearSupplierComponent', () => {
  let component: CrearSupplierComponent;
  let fixture: ComponentFixture<CrearSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearSupplierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
