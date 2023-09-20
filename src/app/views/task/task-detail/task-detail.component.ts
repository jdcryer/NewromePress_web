import { Component, OnInit, ViewChild } from '@angular/core';
import { ITask, newTask, IFile, newFile, IComm, newComm, ILookupValue, IUser,  IContact } from 'src/app/interfaces/table-definitions';
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

  @ViewChild('editorNewMessage', { static: false, read: EditorComponent }) editorNewMessage: EditorComponent;
  @ViewChild('editorClosingStatement', { static: false, read: EditorComponent }) editorClosingStatement: EditorComponent;

  public taskData: ITask;
  public pendingChanges:boolean;
  public editDisabled = false;
  public smartTheme = environment.smartTheme;
  public selectedFile: IFile;
  public fileList: IFile[] = [];
  public selectedFComm: IComm;
  public commList: IComm[] = [];

  constructor(private route: ActivatedRoute, private messageBox: MessageBoxService,
    private dataService: DataService) { }
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
  
  ngOnInit(): void {

    this.route.data.subscribe((data: any) => {
      let index = this.buttons.findIndex(e => { return e.code === 'SAVE' });
			if(index >= 0) this.buttons[index].enabled = false;
			this.pendingChanges = false;

      if (data.data) {
        //Loaded record for view / edit
        this.taskData = data.data.response.task[0];
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
    this.dataService.getData('file', `fk_record=${this.taskData.id}`, (response) => {
      this.fileList = response.response.file;
    });
}

  fileClick(event: any): void {
    let index = this.fileList.findIndex(e => { return e.id === event.detail.id });
    if(index >= 0) {
      this.fileSelectAction(index);
    }
  };
  
  fileSelectAction(index: number): void {
    this.selectedFile = this.fileList[index];
  };

  btnNewFile():void {
    // this.fileList.push(newFile());
  };

  btDeleteFile():void {
    // this.fileList.splice(newContactMethod());
  };

  commClick(event: any): void {
    let index = this.fileList.findIndex(e => { return e.id === event.detail.id });
    if(index >= 0) {
      this.fileSelectAction(index);
    }
  };
  
  commSelectAction(index: number): void {
    this.selectedFile = this.fileList[index];
  };

  btnNewComm():void {
    // this.fileList.push(newComm());
  };

  btDeleteComm():void {
    // this.fileList.splice(newContactMethod());
  };

  valueChanged(event: any): void {
    // console.log("Value change???");
    // console.log(event);
    if(!this.ignoreChange) {
      this.pendingChanges = true;
      let index = this.buttons.findIndex(e => { return e.code === 'SAVE' });
      if(index >= 0) this.buttons[index].enabled = true;
    }else {
      this.ignoreChange = false;
    }
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
