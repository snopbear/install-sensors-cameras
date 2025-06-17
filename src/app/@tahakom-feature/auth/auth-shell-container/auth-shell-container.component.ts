import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: "app-auth-shell-container",
  templateUrl: "./auth-shell-container.component.html",
  styleUrls: ["./auth-shell-container.component.scss"],
  imports: [CommonModule, RouterOutlet],
})
export class AuthShellContainerComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
