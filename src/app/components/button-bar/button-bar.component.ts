import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { IBrowseState } from 'src/app/interfaces/smart-data-list';

@Component({
  selector: 'app-button-bar',
  templateUrl: './button-bar.component.html',
  styleUrls: ['./button-bar.component.scss']
})
export class ButtonBarComponent implements OnInit {

  @Input('resource') resource!: string;  
  @Input('routingTarget') routingTarget: string="";
  @Input('buttons') set _buttons(value : IButton[]) {
    //Loop value array, check for 'default' buttons and pull any missing properties
    //At the same time, build list of unique group indexes
    value.forEach((button: IButton) => {
      let index = this.defaultButtons.findIndex(e => { return e.code === button.code } );
      let params: string[] = []
      if(index >= 0) {
        params = Object.getOwnPropertyNames(this.defaultButtons[index]);
      }else {
        params = [ 'label', 'icon', 'position', 'style', 'enabled' ];
      }
      //Get default values from defaultButtons array / defaultValues object for this button type if not defined
      params.forEach((p: string) => {
        if(button[p] == null) button[p] = (index >= 0) ? this.defaultButtons[index][p] : this.defaultValues[p];
      });
    });
    this.buttons = value;
  };

  public filterargsLeft = { position: 'left' };
  public filterargsCenter = { position: 'center' };
  public filterargsRight = { position: 'right' };
  
  public buttons: IButton[] = [];

  private defaultValues: IButton = {
    code: '',
    label: 'Button',
    icon: '',
    position: 'right',
    style: 'primary',
    enabled: true
  };
  private browseState!: IBrowseState;
  private currentId: string = '';

  constructor(private router: Router, private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.browseState = this.dataService.getStoredData(`${this.resource}browseState`);
    this.route.paramMap.subscribe(a => {
      let id = a.get('id');
      if(id) {
        this.currentId = id;
        if(this.browseState) {
          let queryString = `resource=${this.resource}&selectToken=${this.browseState.selectToken}&currentId=${this.currentId}`;
          this.dataService.getData('navigateState', queryString, (response: any) => {
            this.setNavState(response);
          });
        }else {
          //Disable all nav buttons
          this.setNavState({ hasNext: false, hasPrev: false });
        }
      }else {
        //Disable all nav buttons
        this.setNavState({ hasNext: false, hasPrev: false });
      }
    });
  }

  buttonClick(event: any): void {
    let target = event.target;
    while(target.localName !== 'button') {
      target = target.parentNode;
    }

    let index = this.buttons.findIndex(e => { return e.code === target.id });
    if(index >= 0) {
      if(this.buttons[index].callback) this.buttons[index].callback?.(target.id);
    }
  }

  btExit = () => {
    if(this.routingTarget=="")
      {this.router.navigate([ this.resource ])}
    else
      {this.router.navigate([ this.routingTarget ])}
  };

  btChangeRecord = (action: string) => {
    if((this.browseState) && (this.currentId)) {
      let queryString = `resource=${this.resource}&selectToken=${this.browseState.selectToken}&currentId=${this.currentId}&action=${action}`;
      this.dataService.getData('navigateRecords', queryString, (response: any) => {
        if(response.id) {
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          if(this.routingTarget=="") {
            this.router.navigate([ `${this.resource}/${this.resource}-detail/${response.id}` ])
          } else {
            this.router.navigate([ `${this.routingTarget}/${this.routingTarget}-detail/${response.id}` ])
          }
        };
      });
    }
  };

  setNavState(data: { hasNext: boolean, hasPrev: boolean }) {
    let index = this.buttons.findIndex(e => { return e.code === 'FIRSTRECORD' });
    if(index >= 0) this.buttons[index].enabled = data.hasPrev;

    index = this.buttons.findIndex(e => { return e.code === 'PREVRECORD' });
    if(index >= 0) this.buttons[index].enabled = data.hasPrev;

    index = this.buttons.findIndex(e => { return e.code === 'NEXTRECORD' });
    if(index >= 0) this.buttons[index].enabled = data.hasNext;

    index = this.buttons.findIndex(e => { return e.code === 'LASTRECORD' });
    if(index >= 0) this.buttons[index].enabled = data.hasNext;
  }

  private defaultButtons: IButton[] = [
    {
      code: 'SAVE',
      label: 'Save',
      icon: 'far fa-save',
      position: 'right',
      style: 'primary',
      enabled: true
    },
    { 
      code: 'EXIT',
      label: 'Exit',
      icon: 'far fa-close',
      position: 'right',
      style: 'primary',
      enabled: true,
      callback: this.btExit
    },
    { 
      code: 'FIRSTRECORD',
      label: 'First Record',
      icon: 'far fa-angles-left',
      position: 'left',
      style: 'primary',
      enabled: true,
      callback: this.btChangeRecord
    },
    { 
      code: 'PREVRECORD',
      label: 'Previous Record',
      icon: 'far fa-angle-left',
      position: 'left',
      style: 'primary',
      enabled: true,
      callback: this.btChangeRecord
    },
    { 
      code: 'NEXTRECORD',
      label: 'Next Record',
      icon: 'far fa-angle-right',
      position: 'left',
      style: 'primary',
      enabled: true,
      callback: this.btChangeRecord
    },
    { 
      code: 'LASTRECORD',
      label: 'Last Record',
      icon: 'far fa-angles-right',
      position: 'left',
      style: 'primary',
      enabled: true,
      callback: this.btChangeRecord
    }
  ];
}

export interface IButton {
  code: string;
  label?: string;
  icon?: string;
  groupIndex?: number;
  position?: 'left' | 'right' | 'center';
  style?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  enabled?: boolean;
  callback?: Function;
}
