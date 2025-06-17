/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InstallCamerasComponent } from './install-cameras.component';

describe('InstallCamerasComponent', () => {
  let component: InstallCamerasComponent;
  let fixture: ComponentFixture<InstallCamerasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstallCamerasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallCamerasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
