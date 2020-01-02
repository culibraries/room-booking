import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEnterStudentInfoComponent } from './dialog-enter-student-info.component';

describe('DialogEnterStudentInfoComponent', () => {
  let component: DialogEnterStudentInfoComponent;
  let fixture: ComponentFixture<DialogEnterStudentInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogEnterStudentInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogEnterStudentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
