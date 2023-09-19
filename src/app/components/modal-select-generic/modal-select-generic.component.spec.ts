import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSelectGenericComponent } from './modal-select-generic.component';

describe('ModalSelectGenericComponent', () => {
  let component: ModalSelectGenericComponent;
  let fixture: ComponentFixture<ModalSelectGenericComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSelectGenericComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSelectGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
