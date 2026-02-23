import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { CommonModule } from '@angular/common';
import { DataProviderService } from './services/data-provider.service';
import { HiveItem } from './types/api.types';
import { NgScrollbarModule } from 'ngx-scrollbar';
import {  LucideAngularModule, MapPin, Heart } from 'lucide-angular';

@Component({
  selector: 'app-root',
  imports: [LottieComponent, CommonModule, NgScrollbarModule, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  readonly MapPinIcon = MapPin;
  readonly HeartIcon = Heart;
  
  private readonly dataProvider = inject(DataProviderService);
  protected readonly title = signal('the-happy-hive');
  protected showLoader = signal(true);
  protected hiveItems = signal<HiveItem[]>([]);
  
  options: AnimationOptions = {
    path: '/lotties/thh_loader.json',
    loop: false,
  };

  ngOnInit() {
    this.loadHiveItems();
  }

  private loadHiveItems(): void {
    this.dataProvider.getHiveItems().subscribe({
      next: (items: HiveItem[]) => {
        this.hiveItems.set(this._formatHiveItems(items));
        // Hide loader after items are loaded
        setTimeout(() => {
          this.showLoader.set(false);
        }, 3000);
      },
      error: (error: any) => {
        console.error('Failed to load hive items:', error);
        // Ensure signal has empty array on error
        this.hiveItems.set([]);
        // Hide loader even on error after delay
        setTimeout(() => {
          this.showLoader.set(false);
        }, 1000);
      },
    });
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

    // Sort other items by formatted DOB
    otherItems.sort((a, b) => {
      if (!a.formatted_dob || !b.formatted_dob) return 0;
      const [dayA, monthA] = a.formatted_dob.split(' ');
      const [dayB, monthB] = b.formatted_dob.split(' ');

      const monthIndexA = months.indexOf(monthA);
      const monthIndexB = months.indexOf(monthB);

      if (monthIndexA === monthIndexB) {
        return parseInt(dayA) - parseInt(dayB);
      }
      return monthIndexA - monthIndexB;
    });

    // Return other items first, then passed month items at the end
    return [...otherItems, ...passedMonthItems];
  }
}
