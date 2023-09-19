import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSchedulerComponent } from './admin-scheduler.component';

describe('AdminSchedulerComponent', () => {
  let component: AdminSchedulerComponent;
  let fixture: ComponentFixture<AdminSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminSchedulerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
