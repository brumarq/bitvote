import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EggboxListComponent } from './eggbox-list.component';

describe('EggboxListComponent', () => {
  let component: EggboxListComponent;
  let fixture: ComponentFixture<EggboxListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EggboxListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EggboxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
