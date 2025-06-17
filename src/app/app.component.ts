import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from './@tahakom-shared/components/loading/loading.component';
import { MessagesComponent } from './@tahakom-shared/components/messages/messages.component';
import { ToasterComponent } from './@tahakom-shared/components/toaster/toaster.component';

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    LoadingIndicatorComponent,
    MessagesComponent,
    ToasterComponent,
    RouterLink, // <-- Add this
    RouterLinkActive, // <-- Add this
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class App implements OnInit {
  constructor() {}

  ngOnInit() {}
}
