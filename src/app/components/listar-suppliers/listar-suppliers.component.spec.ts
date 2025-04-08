import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarSuppliersComponent } from './listar-suppliers.component';

describe('ListarSuppliersComponent', () => {
  let component: ListarSuppliersComponent;
  let fixture: ComponentFixture<ListarSuppliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarSuppliersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
