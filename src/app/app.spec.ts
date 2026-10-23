import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { of } from 'rxjs';
import { App } from './app';

const msalMock = {
  handleRedirectObservable: () => of(null),
  instance: {
    getAllAccounts: () => [],
    getActiveAccount: () => null,
    setActiveAccount: () => undefined,
    addEventCallback: () => null
  }
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: MsalService, useValue: msalMock }]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
