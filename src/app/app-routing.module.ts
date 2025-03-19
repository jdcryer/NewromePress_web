import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginContainerComponent } from './containers/login-container/login-container.component';
import { MainContainerComponent } from './containers/main-container/main-container.component';
import { NavBarResolver } from './services/navbar-resolver.service';
import { UserLoginGuard } from './services/user-login-guard.service';
// import { DashboardComponent } from './views/dashboard/dashboard';

const routes: Routes = [
  {
    path: '',
    component: LoginContainerComponent,
    data: { title: 'Newrome Press | Login' },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./views/pages/pages.module').then((m) => m.PagesModule),
      },
    ],
  },
  {
    path: '',
    component: MainContainerComponent,
    data: { title: 'Home' },
    resolve: { navBar: NavBarResolver },
    canActivate: [ UserLoginGuard ],
    children: [
      {
        path: 'task',
        loadChildren: () => import('./views/task/task.module').then((m) => m.TaskModule),
      },
      {
        path: 'system-admin',
        loadChildren: () => import('./views/system-admin/system-admin.module').then(m => m.SystemAdminModule),
      },
      // {//Not sure about this bit???
      //   path: 'dashboard',
      //   component: DashboardComponent
      // }
    ],
  },
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
