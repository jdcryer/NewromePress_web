import { Component, OnInit, ViewChild } from '@angular/core';
import { GridColumn, GridComponent, Smart } from 'smart-webcomponents-angular/grid';
import { MenuComponent } from 'smart-webcomponents-angular/menu';
import { dateToDateString, dateToTimeString, dtStringToDate } from 'src/app/generic-functions';
import { IUserSettings } from 'src/app/interfaces/smart-data-list';
import { DataService } from 'src/app/services/data.service';
import { MessageBoxService } from 'src/app/services/message-box.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-scheduler',
  templateUrl: './admin-scheduler.component.html',
  styleUrls: ['./admin-scheduler.component.scss']
})
export class AdminSchedulerComponent implements OnInit {

  @ViewChild('gridSchedule', { static: true, read: GridComponent }) gridSchedule: GridComponent;
	@ViewChild('gridAction', { static: true, read: GridComponent }) gridAction: GridComponent;
	@ViewChild('menuAction', { static: true, read: MenuComponent }) menuAction: MenuComponent;

  public disabledUser: boolean = true;
	public disabledAdmin: boolean = true;
	public selectedSchedule: ISchedule;
	public selectedAction: IScheduleAction;
	public smartTheme = environment.smartTheme;
	public pendingChanges: boolean = false;
	public bMonthlyDays: boolean = false;
	public actionList: any[] = [];

	private actionLookup: IScheduleAction[];
	private userSettings: IUserSettings;
	private forceSelect: boolean = false;
	private selectedActionId: string = '';
  private selectedActionIndex: number = -1;
  private selectedScheduleId: string = '';
  private selectedScheduleIndex: number = -1;
	private scheduleData: ISchedule[] = [];
	private emptySchedule: ISchedule = {
		name: '', fk_user: '', nextLaunch: '', lastLaunch: '', lastCompleted: '', status: 0,
		detail: { tasks: [], processSize: 0, inactiveOnFailure: false, frequency: { 
			monthChoice: '', period: '', every: 0, timing: '', interval: '', startTime: '', endTime: '', specifiedTime: '', days: [], onDay: { dayNum: '', dayType: '' } } }
	};
	private emptyAction: IScheduleAction = {
		method: '',
		parameters: []
	}

  public gridActionBehavior = {
    allowRowReorder: true,
    columnResizeMode: 'growAndShrink'
  };
  public gridActionAppearance = {
    alternationCount: 2,
    alternationStart: 0,
    showRowHeaderDragIcon: true,
    showRowHeader: true,
  };
  public gridSettings = {
    sorting: {
      enabled: true
    },
    appearance: {
      alternationStart: 0,
      alternationCount: 2
    },
    behavior: {
      columnResizeMode: 'growAndShrink'
    },
    selection: {
      enabled: true,
      defaultSelection: true,
      mode: 'one'
    },
    editing: {
      enabled: true,
      mode: 'cell'
    }
  };

  public gridScheduleDataFields = [
    'id: string',
    'fk_user: string',
    'name: string',
    'active: bool',
  ];
  public gridScheduleSource = new Smart.DataAdapter({
    id: 'id',
    mapChar: '.',
    dataFields: this.gridScheduleDataFields,
    dataSource: []
  });
  public gridScheduleColumns: GridColumn[] = [
    { label: 'Active', dataField: 'active', width: '10%', template: 'checkBox', editor: 'checkBox' },
		{ label: 'Name', dataField: 'name', width: '90%', allowEdit: false }
  ];

  public gridActionDataFields = [
    { name: 'method', type: 'string' },
    { name: 'parameters', type: 'any' },
    { name: 'numParams', type: 'number' },
  ];
  public gridActionSource = new Smart.DataAdapter({
    id: 'method',
    mapChar: '.',
    dataFields: this.gridActionDataFields,
    dataSource: []
  });
  public gridActionColumns: GridColumn[] = [
    { label: 'Action', dataField: 'method', width: '60%' },
		{ label: 'No. Parameters', dataField: 'numParams', width: '30%' }
  ];

  constructor(private dataService: DataService, private messageBox: MessageBoxService) {
    this.selectedSchedule = this.emptySchedule;
		this.selectedAction = this.emptyAction;
		this.userSettings = this.dataService.getStoredData('userSettings');
		this.dataService.getData('schedule', 'order_by=name', (response) => {
      if(response.response.schedule) {
        this.scheduleData = response.response.schedule;
        this.scheduleData.forEach((element) => {
          element.active = (element.status === 1);
        });
        this.gridScheduleSource = new Smart.DataAdapter({
          id: 'id',
          mapChar: '.',
          dataFields: this.gridScheduleDataFields,
          dataSource: this.scheduleData
        });
      }
		});

		this.dataService.getData('scheduleActions', '', (response) => {
			this.actionList = response.menu;
			this.actionLookup = response.lookup;
		});
  }

  ngOnInit(): void {};

  inputChange(event: any): void {
		this.pendingChanges = true;
	};

  monthChoiceChange(event: any): void {
		this.pendingChanges = true;
		this.bMonthlyDays = (this.selectedSchedule.detail.frequency.monthChoice === 'days');
	};

	gridScheduleSelect(event: any): void {
    console.log(event);

		//Warn of lost changes..
		let bContinue = true;
		if(this.pendingChanges) {
			if(!this.forceSelect)
				bContinue = confirm("You have unsaved changes, are you sure you wish to continue?");
			else
				bContinue = false;
		}
		if(bContinue) {
      this.selectedSchedule = this.scheduleData[event.detail.row.index];
      this.selectedScheduleIndex = event.detail.row.index;
      this.selectedScheduleId = this.selectedSchedule.id!;
      this.selectScheduleUpdate();

			//Set editable according to current user
			// switch(this.userSettings.type) {
			// 	case 'system': {
			// 		this.disabledAdmin = false;
			// 	}
			// 	case 'sponsor':
			// 	case 'company':
			// 	case 'brand': {
			// 		this.disabledUser = false;
			// 		break;
			// 	}
			// }

		}else {
			if(!this.forceSelect) {
				this.forceSelect = true;
				setTimeout(this.undoSelect, 100);
			}else {
				this.forceSelect = false;
			}
		}
	};

  gridScheduleCellClick(event: any): void {
    if(event.detail.dataField == 'active') {
      let index = this.scheduleData.findIndex(e => { return e.id == event.detail.id });
      if(index >= 0) {
        let postData = {
					id: this.scheduleData[index].id,
					status: !this.scheduleData[index].active
				}
				this.scheduleData[index].active = !this.scheduleData[index].active;
        this.gridSchedule.setCellValue(event.detail.id, 'active', this.scheduleData[index].active!);
				this.dataService.postData('schedule', postData, (response) => {});
      };
    };
  };

  selectScheduleUpdate(): void {
    this.pendingChanges = false;
    this.gridAction.clearSelection();

    this.selectedAction = this.emptyAction;
    const nextLaunch = new Date(this.selectedSchedule.nextLaunch);
    this.selectedSchedule.nextLaunchTime = dateToTimeString(nextLaunch);
    this.selectedSchedule.nextLaunchDate = dateToDateString(nextLaunch);

    const lastLaunch = new Date(this.selectedSchedule.lastLaunch);
    this.selectedSchedule.lastLaunchTime = dateToTimeString(lastLaunch);
    this.selectedSchedule.lastLaunchDate = dateToDateString(lastLaunch);

    const lastComplete = new Date(this.selectedSchedule.lastCompleted);
    this.selectedSchedule.lastCompletedTime = dateToTimeString(lastComplete);
    this.selectedSchedule.lastCompletedDate = dateToDateString(lastComplete);

    this.bMonthlyDays = (this.selectedSchedule.detail.frequency.monthChoice === 'days');

    this.selectedSchedule.detail.tasks.forEach((element) => {
      element.numParams = element.parameters.length;
    });

    this.gridActionSource = new Smart.DataAdapter({
      id: 'method',
      mapChar: '.',
      dataFields: this.gridActionDataFields,
      dataSource: this.selectedSchedule.detail.tasks
    });

    this.disabledAdmin = false;
    this.disabledUser = false;
  };

  btNewSchedule(event: any): void {
		//initialise default schedule
    //set as selected
    let bContinue = true;
		if(this.pendingChanges) {
			bContinue = confirm("You have unsaved changes, are you sure you wish to continue?");
		}
		if(bContinue) {
			this.pendingChanges = false;
			let newSchedule = {
				name: 'New Schedule', fk_user: this.userSettings.id, nextLaunch: '', lastLaunch: '', lastCompleted: '', status: 0, active: false,
				detail: { tasks: [], processSize: 0, inactiveOnFailure: false, frequency: { 
					monthChoice: '', period: 'daily', every: 1, timing: '', interval: '', startTime: '', endTime: '', specifiedTime: '', days: [], onDay: { dayNum: '', dayType: '' } } }
			};
      this.selectedSchedule = newSchedule;
			this.selectedScheduleId = '';
      this.selectScheduleUpdate();
		}
	};

	btDeleteSchedule(event: any): void {

    if(this.selectedScheduleId != '') {
      if(confirm(`Are you sure you wish to delete the schedule ${this.selectedSchedule.name}?`)) {
        this.dataService.deleteData('schedule', this.selectedScheduleId, (response) => {
          this.selectedSchedule = this.emptySchedule;
					this.selectedAction = this.emptyAction;
          this.gridSchedule.clearSelection();

          let index = this.scheduleData.findIndex(e => { return e.id == this.selectedScheduleId });
          this.scheduleData.splice(index, 1);
          this.selectedScheduleId = '';
          this.selectedActionId = '';

          this.gridActionSource = new Smart.DataAdapter({
            id: 'method',
            mapChar: '.',
            dataFields: this.gridActionDataFields,
            dataSource: []
          });
          this.gridScheduleSource = new Smart.DataAdapter({
            id: 'id',
            mapChar: '.',
            dataFields: this.gridScheduleDataFields,
            dataSource: this.scheduleData
          });
        });
      }
    }else {
      this.messageBox.showWarning('Please first select the schedule you wish to delete');
    }
	}

	buttonSaveClick(): void {
		let nextLaunch = dtStringToDate(this.selectedSchedule.nextLaunchDate!, this.selectedSchedule.nextLaunchTime);
		this.selectedSchedule.nextLaunch = nextLaunch.toISOString().substring(0, 19);

		this.dataService.postData('schedule', this.selectedSchedule, (response) => {
			this.selectedSchedule.id = response.id;
      if(this.selectedScheduleIndex == -1) {
        this.scheduleData.push(response);
      }else {
        this.scheduleData[this.selectedScheduleIndex] = response;
        this.scheduleData[this.selectedScheduleIndex].active = (this.scheduleData[this.selectedScheduleIndex].status === 1)
      }
      this.gridScheduleSource = new Smart.DataAdapter({
        id: 'id',
        mapChar: '.',
        dataFields: this.gridScheduleDataFields,
        dataSource: this.scheduleData
      });

      this.messageBox.showSuccess("Schedule Saved");
			this.pendingChanges = false;
		});
	}

	dayButtonClicked(event: number): void {
		this.pendingChanges = true;
		let copy = this.selectedSchedule.detail.frequency.days!
		let index = copy.indexOf(event)
		if(index == -1) {
			copy.push(event);
		}else{
			copy.splice(index, 1);
		}
    let arr: number[] = [];
		this.selectedSchedule.detail.frequency.days = arr.concat(copy);
	}

  undoSelect = () => {
		this.gridSchedule.select(this.selectedScheduleId);
	};

  selectAction = () => {
		this.gridAction.select(this.selectedActionId);
	};

	gridActionSelect(event: any): void {
		this.selectedAction = this.selectedSchedule.detail.tasks[event.detail.row.index];
    this.selectedActionId = this.selectedAction.id!;
    this.selectedActionIndex = event.detail.row.index;
	};

	btNewAction(event: MouseEvent): void {
    console.log(event);

    this.menuAction.open(event.pageX - 302, event.pageY - 100);


    // let targetElement = event.target;
    // if (targetElement) {
    //   if (targetElement['localName'] == 'i') targetElement = targetElement['parentElement']['parentElement'];
    //   let target = <Element>targetElement;
    //   console.log(target);
    //   let rect = target.getBoundingClientRect();
    //   console.log(rect);
    //   this.menuAction.open(rect.left, rect.top + rect.height + window.scrollY);
    // }
	}

	menuItemClick(event: any): void {
		let param = event.detail.value;
		let idx = this.actionLookup.findIndex((element) => {
			return element.id === param;	
		});
		if(idx >= 0) {
			this.pendingChanges = true;
			let newAction = {
				method: this.actionLookup[idx].method,
				parameters: this.actionLookup[idx].parameters,
				numParams: this.actionLookup[idx].parameters.length
			}
			this.selectedSchedule.detail.tasks.push(newAction);
      this.gridActionSource = new Smart.DataAdapter({
        id: 'method',
        mapChar: '.',
        dataFields: this.gridActionDataFields,
        dataSource: this.selectedSchedule.detail.tasks
      });
			setTimeout(this.selectAction, 100);
		}
	};

	btDeleteAction(): void {
		if(this.selectedActionId != ''){
			if(confirm(`Are you sure you wish to delete the Action ${this.selectedAction.method} ?`)) {
				this.selectedSchedule.detail.tasks.splice(this.selectedActionIndex, 1);
        this.gridActionSource = new Smart.DataAdapter({
          id: 'method',
          mapChar: '.',
          dataFields: this.gridActionDataFields,
          dataSource: this.selectedSchedule.detail.tasks
        });
				this.selectedAction = this.emptyAction;
				this.pendingChanges = true;
			}
		}else{
			this.messageBox.showWarning("Please first select the Action to delete");
		}
	}

	paramDeleted(event: number): void {
		this.pendingChanges = true;
		this.selectedAction.parameters.splice(event, 1);
		this.selectedAction.numParams = this.selectedAction.parameters.length;
		this.gridAction.setCellValue(this.selectedActionId, 'numParams', this.selectedAction.numParams);
	}

	btNewParameter(): void {
		this.pendingChanges = true;
		this.selectedAction.parameters.push({ value: '', type: 'text' });
		this.selectedAction.numParams = this.selectedAction.parameters.length;
		this.gridAction.setCellValue(this.selectedActionId, 'numParams', this.selectedAction.numParams);
	}

};

export interface ISchedule {
  id?: string;
	fk_user: string;
	name: string;
	nextLaunch: string;
	lastLaunch: string;
	lastCompleted: string;
	status: number;
	active?: boolean;
	detail: IScheduleDetail;
	nextLaunchDate?: string;
	nextLaunchTime?: string;
	lastLaunchDate?: string;
	lastLaunchTime?: string;
	lastCompletedDate?: string;
	lastCompletedTime?: string;
};

export interface IScheduleDetail {
	tasks: IScheduleAction[];
	frequency: {
		period: string;
		every: number;
		days: number[];
		onDay: {
			dayNum: string;
			dayType: string;
		};
		monthChoice: string;
		timing: string;
		interval: string;
		startTime: string;
		endTime: string;
		specifiedTime: string;
	};
	processSize: number;
	inactiveOnFailure: boolean;
}

export interface IScheduleAction {
	id?: string;
	method: string;
	parameters: IScheduleParameter[];
	numParams?: number;
}

export interface IScheduleParameter {
	value: any;
	type: string;
}
