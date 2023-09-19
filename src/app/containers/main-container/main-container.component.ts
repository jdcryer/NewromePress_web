import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageBoxService } from 'src/app/services/message-box.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit {

  public navItems = [];
	private componentSubs: Subscription = new Subscription();

  constructor(private messageBox: MessageBoxService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.componentSubs.add(this.activatedRoute.data.subscribe((data: any) => {
			if(data.navBar){
				this.navItems = data.navBar;
			}
		}));
  };

  ngOnDestroy(): void {
    this.componentSubs.unsubscribe();
  };

};
