import { Component, OnInit } from '@angular/core';
import { MessageBoxService } from 'src/app/services/message-box.service';

@Component({
  selector: 'app-toast-global',
  templateUrl: './toast-global.component.html',
  styleUrls: ['./toast-global.component.scss']
})
export class ToastGlobalComponent implements OnInit {

  constructor(public messageBox: MessageBoxService) { }

  ngOnInit(): void {
  }

}
