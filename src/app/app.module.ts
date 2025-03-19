import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, loadUserSettings } from './app.component';
import { NavSidebarComponent } from './components/nav-sidebar/nav-sidebar.component';
import { ToastGlobalComponent } from './components/toast-global/toast-global.component';
import { LoginContainerComponent } from './containers/login-container/login-container.component';
import { MainContainerComponent } from './containers/main-container/main-container.component';
import { MainFooterComponent } from './containers/main-container/main-footer/main-footer.component';
import { MainHeaderComponent } from './containers/main-container/main-header/main-header.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { SafePipeModule } from 'safe-pipe';
import { NotificationModule } from './components/notification/notification.module';
import { SmartDataListModule } from './components/smart-data-list/smart-data-list.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataService } from './services/data.service';
import { MessageBoxService } from './services/message-box.service';
import { AppStartService } from './services/app-start.service';
//import { DashboardComponent } from './views/dashboard/dashboard';

window.Smart.License = "8414516F-15A2-4D84-A7AF-A9A72400DB02";

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/');
};

@NgModule({
  declarations: [
    AppComponent,
    LoginContainerComponent,
    MainContainerComponent,
    NavSidebarComponent,
    MainHeaderComponent,
    MainFooterComponent,
    ToastGlobalComponent
    // DashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    SmartDataListModule,
    HttpClientModule,
    NgSelectModule,
    SafePipeModule,
    NgbToastModule,
    NotificationModule,
    TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [ HttpClient ]	
			}
		}),
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    Title,
    DataService,
    MessageBoxService,
    NgSelectConfig,
    {
			provide: APP_INITIALIZER,
			useFactory: loadUserSettings,
			deps: [ AppStartService ],
			multi: true
		}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
