import { Component, Input, OnInit } from '@angular/core';
import { INavData } from 'src/app/interfaces/smart-data-list';

@Component({
  selector: 'app-nav-sidebar',
  templateUrl: './nav-sidebar.component.html',
  styleUrls: ['./nav-sidebar.component.scss']
})
export class NavSidebarComponent implements OnInit {

  @Input('brandImageSrc') brandImageSrc: string = ''; 
  @Input('brandImageWidth') brandImageWidth: number = 200; 
  @Input('brandImageHeight') brandImageHeight: number = 60; 
  @Input('brandImageAlt') brandImageAlt: string = 'Project Name'; 
  @Input('navItems') navItems: INavData[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
