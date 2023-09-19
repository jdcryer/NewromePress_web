import { Component, OnInit } from '@angular/core';
import { IClient, newClient } from 'src/app/interfaces/table-definitions';
import { DataService } from 'src/app/services/data.service';
import { MessageBoxService } from 'src/app/services/message-box.service';

@Component({
  selector: 'app-system-admin',
  templateUrl: './system-admin.component.html',
  styleUrls: ['./system-admin.component.scss']
})
export class SystemAdminComponent implements OnInit {

  constructor(private dataService: DataService, private messageBox: MessageBoxService) { }

  ngOnInit(): void {}

}
