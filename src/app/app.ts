import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-root',
  imports: [LottieComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('the-happy-hive');
  options: AnimationOptions = {
    path: '/lotties/thh_loader.json',
    loop: false,
  };
}
