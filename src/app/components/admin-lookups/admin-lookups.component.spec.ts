import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLookupsComponent } from './admin-lookups.component';

describe('AdminLookupsComponent', () => {
  let component: AdminLookupsComponent;
  let fixture: ComponentFixture<AdminLookupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminLookupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLookupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
