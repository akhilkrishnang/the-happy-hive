import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { App } from './app';
import { DataProviderService } from './services/data-provider.service';

class MockDataProviderService {
  getHiveItems() {
    return of([]);
  }

  getSpotlights() {
    return of([]);
  }
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: DataProviderService, useClass: MockDataProviderService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should skip the loader when the loader container is clicked', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    fixture.detectChanges();

    const loader = fixture.nativeElement.querySelector('.logo-loader-container') as HTMLElement;
    loader.click();
    fixture.detectChanges();

    expect(app['showLoader']()).toBeFalsy();
  });

  it('should add a default spotlight with the meetup date and birthday count', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    const currentDate = new Date();
    const currentMonthBirthday = new Date(currentDate.getFullYear(), currentDate.getMonth(), 10).toISOString();
    const nextMonthBirthday = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5).toISOString();

    app['hiveItems'].set([
      { id: 1, name: 'Alice', dob: currentMonthBirthday, created_at: '', updated_at: '' },
      { id: 2, name: 'Bob', dob: nextMonthBirthday, created_at: '', updated_at: '' },
    ] as any);

    app['addDefaultSpotlights']();

    expect(app['allSpotlightsResponse'].length).toBe(1);
    expect(app['allSpotlightsResponse'][0].description).toContain('Monthly meetup planned on');
    expect(app['allSpotlightsResponse'][0].description).toContain("We have 1 b'days to celebrate");
  });
});
