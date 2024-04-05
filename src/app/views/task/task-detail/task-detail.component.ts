import { Component, OnInit, ViewChild } from '@angular/core';
import { ITask, newTask, IFile, newFile, IComm, newComm, ILookupValue, IUser,  IContact, ITitle, newTitle, newContact } from 'src/app/interfaces/table-definitions';
import { ActivatedRoute } from '@angular/router';
import { MessageBoxService } from 'src/app/services/message-box.service';
import { DataService } from 'src/app/services/data.service';
import { IButton } from 'src/app/components/button-bar/button-bar.component';
import { Smart, GridColumn, GridComponent } from 'smart-webcomponents-angular/grid';
import { environment } from 'src/environments/environment';
import { EditorComponent } from 'smart-webcomponents-angular/editor';


@Component({
	selector: 'app-task-detail',
	templateUrl: './task-detail.component.html',
	styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {

	@ViewChild('gridComm', { read: GridComponent, static: true }) gridComm: GridComponent;
	@ViewChild('gridFile', { read: GridComponent, static: true }) gridFile: GridComponent;

	public taskData!: ITask;
	public titleData!: ITitle;
	public contactData!: IContact;
	public selectedCommData: IComm = newComm();
	public selectedCommIndex: number = -1;
	public pendingChanges:boolean;
	public editDisabled = false;
	public smartTheme = environment.smartTheme;
	public selectedFile: IFile;
	public fileList: IFile[] = [];
	public commList: IComm[] = [];
	public fileDisplaySrc = '';
	public commNoteDisabled: boolean = true;
	public previewFileTypes = [ '.pdf', '.png', '.jpg', '.jpeg', '.svg' ];
	public fileUploadUrl: string = '';
	public fileUploadDisabled: boolean = true;
  private atag_Link: HTMLAnchorElement;

	constructor(private route: ActivatedRoute, private messageBox: MessageBoxService,
		private dataService: DataService) { };

  private ignoreChange: boolean = false;

  public gridSettings = {
    appearance: {
      alternationStart: 0,
      alternationCount: 2
    },
    behavior: {
      columnResizeMode: 'growAndShrink'
    },
    selection: {
      enabled: true,
      allowRowSelection: true,
      mode: 'one'
    },
    editing: {
      enabled: true
    }
  };

  public fileColumns: GridColumn[] = [
    { label: 'Name', dataField: 'name', width: '25%', allowEdit: false },
    { label: 'Path', dataField: 'path', width: '60%', allowEdit: false},
    { label: 'Type', dataField: 'fileType', width: '15%', allowEdit: false },
  ];

  public commColumns: GridColumn[] = [
    { label: 'Direction', dataField: 'direction', width: '20%', allowEdit: false },
    { label: 'Date', dataField: 'date', width: '30%', allowEdit: false},
    { label: 'Text', dataField: 'text', width: '50%', allowEdit: false },
  ];

  public contactDataFields = [
    { name: 'id', dataType: 'string' },
    { name: 'fk_task', dataType: 'string' },
    { name: 'fk_contact', dataType: 'string' },
    { name: 'role', dataType: 'string' },
    { name: 'taskContact_contact', dataType: 'object' },
    { name: 'salutation', dataType: 'string', map: 'taskContact_contact.salutation' }
  ];
  public contactSource = new Smart.DataAdapter({
    mapChar: '.',
    dataFields: this.contactDataFields,
    id: 'id',
    dataSource: [],
  });
  public contactColumns: GridColumn[] = [
    { label: 'Contact', dataField: 'salutation', width: '50%' },
    { label: 'Role', dataField: 'role', width: '50%' },
  ];

	ngOnInit(): void {

		this.route.data.subscribe((data: any) => {
			let index = this.buttons.findIndex(e => { return e.code === 'SAVE' });
			if(index >= 0) this.buttons[index].enabled = false;
			this.pendingChanges = false;

			if (data.data) {
				//Loaded record for view / edit
				this.taskData = data.data.response.task[0];
				this.titleData = (this.taskData.task_title) ? this.taskData.task_title : newTitle();

				if(this.taskData.task_contactAssigned) {
					this.contactData = this.taskData.task_contactAssigned;
				}else {
					this.contactData = newContact()
					this.contactData.salutation = '';
				};
        if(this.taskData.task_taskContact) {
          this.contactSource = new Smart.DataAdapter({
            mapChar: '.',
            dataFields: this.contactDataFields,
            id: 'id',
            dataSource: this.taskData.task_taskContact,
          });
        };
				this.fileUploadUrl = `${environment.baseUrlTemp}fileUpload?table=task&id=${this.taskData.id}`;
				this.fileUploadDisabled = false;

				this.dataService.getData('file', `fk_record=${this.taskData.id}`, (response) => {
					this.fileList = response.response.file;
				});

			} else {
				//New record
				this.taskData = newTask();

				let index = this.buttons.findIndex(e => { return e.code === 'FIRSTRECORD' });
				if(index >= 0) this.buttons[index].enabled = false;
				index = this.buttons.findIndex(e => { return e.code === 'PREVRECORD' });
				if(index >= 0) this.buttons[index].enabled = false;
				index = this.buttons.findIndex(e => { return e.code === 'NEXTRECORD' });
				if(index >= 0) this.buttons[index].enabled = false;
				index = this.buttons.findIndex(e => { return e.code === 'LASTRECORD' });
				if(index >= 0) this.buttons[index].enabled = false;
			}
		});
		this.atag_Link = document.getElementById('atag_Link') as HTMLAnchorElement;
	}

	fileClick(event: any): void {
		this.fileSelectAction(event.detail.id);
	};

	fileUploadComplete(event: any): void {
		if(event.detail.status == 200) {
			this.gridFile.clearSelection();
			this.selectedFile = newFile();
			this.fileDisplaySrc = '';

			this.dataService.getData('file', `fk_record=${this.taskData.id}`, (response) => {
				this.fileList = response.response.file;
			});

    }else {
      this.messageBox.showError('Error uploading attachment!');
    }
	};

	fileSelectAction(index: number): void {
		this.selectedFile = this.fileList[index];
		if(this.previewFileTypes.indexOf(this.selectedFile.fileType) >= 0) {
			this.fileDisplaySrc = (this.selectedFile.cdnUrl) ? this.selectedFile.cdnUrl : '';
		}else {
			this.fileDisplaySrc = '';
		}
	};

	btnDownloadFile(): void {
		if(this.selectedFile.cdnUrl != '') {
			this.atag_Link.href = this.selectedFile.cdnUrl!;
			this.atag_Link.download = `${this.selectedFile.name}${this.selectedFile.fileType}`;
			this.atag_Link.click();
		};
	};

	commClick(event: any): void {
		this.selectedCommData = this.taskData.detail.response[event.detail.id];
		this.selectedCommIndex = event.detail.id;
		this.commNoteDisabled = (this.selectedCommData.direction != 'In');
	};

	commSelectAction(index: number): void {
		this.selectedFile = this.fileList[index];
	};

	btnNewComm():void {
		// this.fileList.push(newComm());
		let newCommRec = newComm();
		newCommRec.direction = 'In';
		newCommRec.date = new Date().toISOString().substring(0, 19);
		this.taskData.detail.response.push(newCommRec);
		this.gridComm.dataSource = this.taskData.detail.response;
		this.selectedCommData = this.taskData.detail.response[this.taskData.detail.response.length - 1];
		this.selectedCommIndex = this.taskData.detail.response.length - 1;
		this.gridComm.selectRows([ this.taskData.detail.response.length - 1 ]);

		this.pendingChanges = true;
		this.commNoteDisabled = false;
	};

	btDeleteComm():void {
		if(this.selectedCommData.direction == 'In') {
			if(confirm(`Are you sure you wish to delete the selected Communication?`)) {
				this.taskData.detail.response.splice(this.selectedCommIndex, 1);
				this.selectedCommData = newComm();
				this.selectedCommIndex = -1;
				this.commNoteDisabled = true;
				this.gridComm.dataSource = this.taskData.detail.response;
				this.gridComm.clearSelection();
				this.pendingChanges = true;
			};
		}else {
			this.messageBox.showWarning('Cannot Delete!', `Only 'In' communications can be deleted.`);
		};
	};

	valueChanged(event: any): void {
		if(!this.ignoreChange) {
			this.pendingChanges = true;
			let index = this.buttons.findIndex(e => { return e.code === 'SAVE' });
			if(index >= 0) this.buttons[index].enabled = true;
		}else {
			this.ignoreChange = false;
		}
	};

	commNoteChanged(): void {
		this.gridComm.setCellValue(this.selectedCommIndex, 'text', this.selectedCommData.text);
	};

	saveButtonClick = () => {
			this.dataService.postData('task', this.taskData, (response) => {
				this.taskData.id = response.id;
				this.pendingChanges = false;
				let index = this.buttons.findIndex(e => { return e.code === 'SAVE' });
				if(index >= 0) this.buttons[index].enabled = false;
				this.messageBox.showSuccess('Task Saved');
			});
	};

	public buttons: IButton[] = [
		{ code: 'FIRSTRECORD' },
		{ code: 'PREVRECORD' },
		{ code: 'NEXTRECORD' },
		{ code: 'LASTRECORD' },
		{ code: 'EXIT' },
		{ code: 'SAVE', callback: this.saveButtonClick, enabled: false },
	];

}
