import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { CommonModule } from '@angular/common';
import { DataProviderService } from './services/data-provider.service';
import { HiveItem } from './types/api.types';

@Component({
  selector: 'app-root',
  imports: [LottieComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
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
        this.hiveItems.set(items);
        console.log('Hive items loaded:', items);
        // Hide loader after items are loaded
        setTimeout(() => {
          this.showLoader.set(false);
        }, 1000);
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
}
