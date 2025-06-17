import {Component, inject, Signal} from "@angular/core";
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from "@angular/router";
import { LoadingService } from "./loading.service";

@Component({
    selector: "loading",
    templateUrl: "./loading.component.html",
    styleUrls: ["./loading.component.scss"],
    imports: []
})
export class LoadingIndicatorComponent {

  loadingService = inject(LoadingService);

  loading = this.loadingService.loading;

}
