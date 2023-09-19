import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { AppStartService } from './services/app-start.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'Newrome Press';

  constructor(
    private router: Router,
    private titleService: Title,
    private translate: TranslateService
  ) {
    titleService.setTitle(this.title);
    // iconSet singleton
    translate.setDefaultLang('en');
    translate.use(environment.lang);
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt : any) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
  }
}

export function loadUserSettings(appStart: AppStartService) {
	return () => appStart.getUserSettings();
}