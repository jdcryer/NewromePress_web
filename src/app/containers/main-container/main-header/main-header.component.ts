import { Component, OnInit } from '@angular/core';
import { IUserSettings } from 'src/app/interfaces/smart-data-list';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent implements OnInit {
  public userSettings:IUserSettings

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.userSettings = this.dataService.getStoredData('userSettings');
  }
	helpClicked() {
		window.open(`${window.location.origin}/help/`, '_blank');
	}

}
