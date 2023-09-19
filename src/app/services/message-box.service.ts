import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageBoxService {

  public toasts: IToastData[] = [];

  constructor() { }

  showSuccess(header : string, body : string = '') {
    let options: IToastData = {
      header: header,
      body: body,
      delay: 7500,
      classname: 'bg-success text-light',
    }
    this.toasts.push(options);
  };
  
  showError(header : string, body : string = '') {
    let options: IToastData = {
      header: header,
      body: body,
      delay: 7500,
      classname: 'bg-danger text-light',
    }
    this.toasts.push(options);
  };

  showWarning(header : string, body : string = '') {
    let options: IToastData = {
      header: header,
      body: body,
      delay: 7500,
      classname: 'bg-warning text-light',
    }
    this.toasts.push(options);
  };

  showInfo(header : string, body : string = '') {
    let options: IToastData = {
      header: header,
      body: body,
      delay: 7500,
      classname: 'bg-primary text-light',
    }
    this.toasts.push(options);
  };

  remove(toast: IToastData) {
    this.toasts = this.toasts.filter(t => t != toast);
  };

}

export interface IToastData {
  header: string;
  body: string;
  delay?: number;
  classname?: string;
};
