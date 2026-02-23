import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [LottieComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('the-happy-hive');
  protected showLoader = signal(true);
  options: AnimationOptions = {
    path: '/lotties/thh_loader.json',
    loop: false,
  };

  ngOnInit() {

    

    setTimeout(() => {
      this.showLoader.set(false);
    }, 4000);
  }
}
