import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import { logError } from './app/core/utils/logger';

registerSwiperElements();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => logError('Bootstrap error', err));
