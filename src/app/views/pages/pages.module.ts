import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { LoginComponent } from './login/login.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    LoginComponent,
    Page404Component,
    Page500Component,
    ResetPasswordComponent,
    NewPasswordComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PagesRoutingModule,
  ]
})
export class PagesModule {
}
