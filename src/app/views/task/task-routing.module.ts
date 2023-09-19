import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskListingComponent } from './task-listing/task-listing.component';
import { LangResolverService } from 'src/app/services/lang-resolver.service';
import { GridDefResolverService } from 'src/app/services/grid-def-resolver.service';
import { DetailResolverService } from 'src/app/services/detail-resolver.service';

const routes: Routes = [
  { path: '', redirectTo: 'task-listing' },
  {
    path: 'task-listing',
    component: TaskListingComponent,
    resolve: { lang: LangResolverService, gridDef: GridDefResolverService }
  },
  {
    path: 'task-detail/:id',
    component: TaskDetailComponent,
    resolve: { data: DetailResolverService },
  },
  {
    path: 'task-detail',
    component: TaskDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskRoutingModule { }
