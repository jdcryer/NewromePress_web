import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardResolverService } from '../../services/dashboard-resolver.service';

const routes: Routes = [{ path: '', component: DashboardComponent, resolve: { data: DashboardResolverService } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
