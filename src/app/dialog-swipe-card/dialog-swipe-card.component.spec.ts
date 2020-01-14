import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSwipeCardComponent } from './dialog-swipe-card.component';

describe('DialogSwipeCardComponent', () => {
  let component: DialogSwipeCardComponent;
  let fixture: ComponentFixture<DialogSwipeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogSwipeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogSwipeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
