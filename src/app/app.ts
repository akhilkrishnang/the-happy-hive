import { Component, signal, OnInit, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { CommonModule } from '@angular/common';
import { DataProviderService } from './services/data-provider.service';
import { HiveItem, Spotlight } from './types/api.types';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { LucideAngularModule, MapPin, Heart, Trophy, Star, Gift, Cake, Award, Zap, Lightbulb, Megaphone, Bell, Baby, Calendar, PartyPopper } from 'lucide-angular';

@Component({
  selector: 'app-root',
  imports: [LottieComponent, CommonModule, NgScrollbarModule, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {

  readonly MapPinIcon = MapPin;
  readonly HeartIcon = Heart;
  readonly TrophyIcon = Trophy;
  readonly StarIcon = Star;
  readonly GiftIcon = Gift;
  readonly CakeIcon = Cake;
  readonly AwardIcon = Award;
  readonly ZapIcon = Zap;
  readonly LightbulbIcon = Lightbulb;
  readonly MegaphoneIcon = Megaphone;
  readonly BellIcon = Bell;
  readonly BabyIcon = Baby;
  readonly CalendarIcon = Calendar;
  readonly PartyPopperIcon = PartyPopper;

  private readonly dataProvider = inject(DataProviderService);
  protected readonly title = signal('the-happy-hive');
  protected showLoader = signal(true);
  protected hiveItems = signal<HiveItem[]>([]);
  protected spotlights = signal<Spotlight[]>([]);
  private allSpotlightsResponse: Spotlight[] = [];
  private intervalId: any;

  options: AnimationOptions = {
    path: '/lotties/thh_loader.json',
    loop: false,
  };

  ngOnInit() {
    this.loadInitialData();
  }

  skipLoader(): void {
    this.showLoader.set(false);
  }

  private loadInitialData(): void {
    forkJoin({
      hiveItems: this.dataProvider.getHiveItems(),
      spotlights: this.dataProvider.getSpotlights(),
    }).subscribe({
      next: ({ hiveItems, spotlights }) => {
        this.hiveItems.set(this._formatHiveItems(hiveItems));
        this.allSpotlightsResponse = spotlights;
        this.addDefaultSpotlights();
        setTimeout(() => {
          this.updateDisplayedItems();
          this.startRotation();
          this.showLoader.set(false);
        }, 4000);
      },
      error: (error: any) => {
        console.error('Failed to load initial data:', error);
        this.hiveItems.set([]);
        this.allSpotlightsResponse = [];
        this.spotlights.set([]);
        setTimeout(() => {
          this.showLoader.set(false);
        }, 1000);
      },
    });
  }

  private addDefaultSpotlights(): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const lastWednesday = new Date(lastDayOfMonth);

    const dayOfWeek = lastWednesday.getDay();
    const daysToSubtract = (dayOfWeek - 3 + 7) % 7;
    lastWednesday.setDate(lastDayOfMonth.getDate() - daysToSubtract);

    const birthdaysInCurrentMonth = this.hiveItems().filter((item) => {
      if (!item.dob) {
        return false;
      }

      const dob = new Date(item.dob);
      return dob.getMonth() === currentMonth;
    }).length;

    const meetupDate = `${lastWednesday.getDate()} ${lastWednesday.toLocaleString('en-US', { month: 'short' })}`;
    const description1 = `Monthly meetup planned on ${meetupDate}. `;
    const description2 = `We have ${birthdaysInCurrentMonth} b'days to celebrate`;

    this.allSpotlightsResponse = [
      ...this.allSpotlightsResponse,
      {
        id: Date.now(),
        description: birthdaysInCurrentMonth > 0 ? (description1 + description2) : description1,
        type: 'birthday',
        expiry: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  startRotation(): void {
    // Use setInterval to rotate the array every 5 seconds
    this.intervalId = setInterval(() => {
      this.rotateArray(1);
      this.updateDisplayedItems();
    }, 5000);
  }

  // Function to rotate the array using splice and push
  rotateArray(steps: number): void {
    const n = this.allSpotlightsResponse.length;
    // Normalize steps in case it's larger than array length
    steps %= n;
    // Remove the first 'steps' elements and add them to the end
    const rotatedElements = this.allSpotlightsResponse.splice(0, steps);
    this.allSpotlightsResponse.push(...rotatedElements);
  }

  // Function to get the first N elements of the rotated array
  updateDisplayedItems(): void {
    this.spotlights.set(this.allSpotlightsResponse.slice(0, 4));
  }

  //Function to format hive items
  //Format the DOB to DD MMM format and add it as a new field to the HiveItem
  //Also sort it based on the DOB in ascending order of date & month (ignoring the year)
  //If item DOB is passed month in this year, it should be queued at end of the list
  private _formatHiveItems(items: HiveItem[]): HiveItem[] {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const now = new Date();
    const currentMonth = now.getMonth();

    const formattedItems = items.map(item => {
      if (item.dob) {
        const date = new Date(item.dob);
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const isMonthPassed = date.getMonth() < currentMonth;
        return { ...item, formatted_dob: `${day} ${month}`, isMonthPassed };
      }
      return { ...item, isMonthPassed: false };
    });

    // Separate items: current month passed and others
    const passedMonthItems = formattedItems.filter(item => item.isMonthPassed);
    const otherItems = formattedItems.filter(item => !item.isMonthPassed);

    // Sort function for formatting DOB
    const sortByDob = (a: any, b: any) => {
      if (!a.formatted_dob || !b.formatted_dob) return 0;
      const [dayA, monthA] = a.formatted_dob.split(' ');
      const [dayB, monthB] = b.formatted_dob.split(' ');

      const monthIndexA = months.indexOf(monthA);
      const monthIndexB = months.indexOf(monthB);

      if (monthIndexA === monthIndexB) {
        return parseInt(dayA) - parseInt(dayB);
      }
      return monthIndexA - monthIndexB;
    };

    // Sort both other items and passed month items by formatted DOB
    otherItems.sort(sortByDob);
    passedMonthItems.sort(sortByDob);

    // Return other items first, then passed month items at the end
    return [...otherItems, ...passedMonthItems];
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
