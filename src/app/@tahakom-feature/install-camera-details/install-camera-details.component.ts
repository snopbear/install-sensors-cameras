import { Component, input, OnInit, output } from '@angular/core';
import { INetworkDevice } from '../../@tahakom-core/models/interfaces/network-device/network-device';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: "app-install-camera-details",
  templateUrl: "./install-camera-details.component.html",
  styleUrls: ["./install-camera-details.component.css"],
  imports: [],
})
export class InstallCameraDetailsComponent implements OnInit {
  networkDevice = input.required<INetworkDevice|null>();

  actionString = output<INetworkDevice>();

  action() {
    // this.actionString.emit(this.networkDevice());
  }
  constructor() {}

  ngOnInit() {}
}
