import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  date: number = (new Date()).getFullYear();
  
  constructor() { }

  ngOnInit(): void {
  }

}
