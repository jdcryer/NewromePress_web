import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  public step = 1;

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
  }

  reset(email: string): void {
    let postData = { email: email };
    this.dataService.postData('resetRequest', postData, (response) => {
      this.step = 2;
    });
  }

  backToLogin(): void {
    this.router.navigate([ 'login' ]);
  }

}
