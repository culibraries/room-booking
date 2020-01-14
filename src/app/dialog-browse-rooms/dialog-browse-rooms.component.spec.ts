import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogBrowseRoomsComponent } from './dialog-browse-rooms.component';

describe('DialogBrowseRoomsComponent', () => {
  let component: DialogBrowseRoomsComponent;
  let fixture: ComponentFixture<DialogBrowseRoomsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogBrowseRoomsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogBrowseRoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
