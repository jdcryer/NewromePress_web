import { Component, OnInit } from '@angular/core';
import { IGridDefiniton } from 'src/app/interfaces/smart-data-list';
import { dataListButtons } from 'src/app/data-list-buttons';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-task-listing',
  templateUrl: './task-listing.component.html',
  styleUrls: ['./task-listing.component.scss']
})
export class TaskListingComponent implements OnInit {

  public dataListButtons = dataListButtons;
  public gridDef: IGridDefiniton;
  private componentSubs: Subscription = new Subscription();

  constructor(private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.componentSubs.add(this.activatedRoute.data.subscribe((data: any) => {
      this.gridDef = data.gridDef;
    }));
  };

  newRecord(): void {
    this.router.navigate([ 'task/task-detail' ]);
  };

  ngOnDestroy(): void {
    this.componentSubs.unsubscribe();
  };

}
