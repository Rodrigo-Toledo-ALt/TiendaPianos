import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PianoFormComponent } from './piano-form.component';

describe('PianoFormComponent', () => {
  let component: PianoFormComponent;
  let fixture: ComponentFixture<PianoFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PianoFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PianoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
