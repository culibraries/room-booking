import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSelectTimesComponent } from './dialog-select-times.component';

describe('DialogSelectTimesComponent', () => {
  let component: DialogSelectTimesComponent;
  let fixture: ComponentFixture<DialogSelectTimesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogSelectTimesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogSelectTimesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
