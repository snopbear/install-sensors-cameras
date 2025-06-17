import {
  Component,
  inject,
  OnInit,
  WritableSignal,
  signal,
  DestroyRef,
  OnDestroy,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { INetworkDevice } from "@models/interfaces/network-device/network-device";
import { CommonModule } from "@angular/common";
import { InstallCameraDetailsComponent } from "../install-camera-details/install-camera-details.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastrService } from "ngx-toastr";
import { MessagesService } from "src/app/@tahakom-shared/components/messages/messages.service";
import { ToasterService } from "src/app/@tahakom-shared/components/toaster/toaster-service/toaster.service";
import { NetworkDeviceService } from "@services/modules/network-devices/network-devices.service";

@Component({
  selector: "app-install-cameras",
  templateUrl: "./install-cameras.component.html",
  styleUrls: ["./install-cameras.component.scss"],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
})
export class InstallCamerasComponent implements OnInit, OnDestroy {
  // Injected services
  private fb = inject(FormBuilder);
  private networkDeviceService = inject(NetworkDeviceService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastrService);
  private messageService = inject(MessagesService);
  private toaster = inject(ToasterService);
  private destroyRef = inject(DestroyRef);

  // Writable signals for component state
  readonly networkDevices: WritableSignal<INetworkDevice[]> = signal([]);
  readonly cameraTypes: WritableSignal<string[]> = signal([]);

  // Form initialization
  readonly deviceForm = this.fb.group({
    type: ["camera", Validators.required],
    cameraId: [""],
    ipAddress: [
      "",
      [Validators.required, Validators.pattern(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)],
    ],
    username: [""],
    password: [""],
    fps: [""],
    city: [""],
    director: [""],
    latitude: [0, Validators.required],
    longitude: [0, Validators.required],
    street: [""],
  });

  // Constants
  // private readonly DEFAULT_FORM_VALUES = {
  //   type: "",
  //   cameraId: "",
  //   ipAddress: "",
  //   username: "",
  //   password: "",
  //   fps: "",
  //   city: "",
  //   director: "",
  //   latitude: 0,
  //   longitude: 0,
  //   street: "",
  // };

  // readonly deviceForm = this.fb.group({
  //   type: [this.DEFAULT_FORM_VALUES.type, Validators.required],
  //   cameraId: [this.DEFAULT_FORM_VALUES.cameraId],
  //   ipAddress: [
  //     this.DEFAULT_FORM_VALUES.ipAddress,
  //     [Validators.required, Validators.pattern(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)],
  //   ],
  //   username: [this.DEFAULT_FORM_VALUES.username],
  //   password: [this.DEFAULT_FORM_VALUES.password],
  //   fps: [this.DEFAULT_FORM_VALUES.fps],
  //   city: [this.DEFAULT_FORM_VALUES.city],
  //   director: [this.DEFAULT_FORM_VALUES.director],
  //   latitude: [this.DEFAULT_FORM_VALUES.latitude, Validators.required],
  //   longitude: [this.DEFAULT_FORM_VALUES.longitude, Validators.required],
  //   street: [this.DEFAULT_FORM_VALUES.street],
  // });

  // Editing state
  readonly isEditing: WritableSignal<boolean> = signal(false);
  readonly currentDeviceId: WritableSignal<number | undefined> =
    signal(undefined);

  // Details signal
  readonly detailsNetworkDevice: WritableSignal<INetworkDevice | null> =
    signal(null);

  ngOnInit(): void {
    console.log("Component INITIALIZED install camera");

    // Load resolved data from route resolver
    const preloadData = this.route.snapshot.data["preload"] as [
      INetworkDevice[],
      string[]
    ];

    if (preloadData) {
      const [networkDevices, cameraTypes] = preloadData;
      this.networkDevices.set(networkDevices);
      this.cameraTypes.set(cameraTypes);
    } else {
      // Fallback if no resolver data (optional)
      this.loadInitialData();
    }
  }

  private loadInitialData() {
    this.networkDeviceService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (devices) => this.networkDevices.set(devices),
        error: (err) => this.handleError("Failed to load network devices", err),
      });

    this.networkDeviceService
      .getCameraTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (types) => this.cameraTypes.set(types),
        error: (err) => this.handleError("Failed to load camera types", err),
      });
  }

  save() {
    if (this.deviceForm.invalid) {
      this.deviceForm.markAllAsTouched();
      return;
    }

    const formValue = this.deviceForm.getRawValue();

    const device: INetworkDevice = {
      id: this.currentDeviceId() || 0,
      type: formValue.type as "camera" | "sensor" | "router" | "other",
      cameraId: formValue.cameraId || undefined,
      ipAddress: formValue.ipAddress ?? "", // <-- here
      username: formValue.username || undefined,
      password: formValue.password || undefined,
      fps: formValue.fps || undefined,
      city: formValue.city || undefined,
      director: formValue.director || undefined,
      latitude: formValue.latitude ?? 0,
      longitude: formValue.longitude ?? 0,
      street: formValue.street || undefined,
      status: "online",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const operation$ = this.isEditing()
      ? this.networkDeviceService.update(device.id, device)
      : this.networkDeviceService.create(device);

    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (savedDevice) => {
        this.detailsNetworkDevice.set(savedDevice);
        this.resetFormState();
        this.toast.success(
          this.isEditing()
            ? "Device updated successfully"
            : "Device created successfully"
        );
        this.refreshDeviceList();
      },
      error: (err) => this.handleError("Failed to save device", err),
    });
  }

  edit(device: INetworkDevice) {
    this.isEditing.set(true);
    this.currentDeviceId.set(device.id);
    this.deviceForm.patchValue(device);
    this.detailsNetworkDevice.set(device);
  }

  cancel() {
    this.resetFormState();
  }

  delete(id?: number) {
    if (!id || !confirm("Are you sure you want to delete this device?")) return;

    this.networkDeviceService
      .delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success("Device deleted successfully");
          this.detailsNetworkDevice.set(null);
          this.refreshDeviceList();
          this.resetFormState();
        },
        error: (err) => this.handleError("Failed to delete device", err),
      });
  }

  private refreshDeviceList() {
    this.networkDeviceService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (devices) => this.networkDevices.set(devices),
        error: (err) => this.handleError("Failed to refresh device list", err),
      });
  }

  private resetFormState() {
    this.isEditing.set(false);
    this.currentDeviceId.set(undefined);
    this.deviceForm.reset({
      type: "camera",
      cameraId: "",
      ipAddress: "",
      username: "",
      password: "",
      fps: "",
      city: "",
      director: "",
      latitude: 0,
      longitude: 0,
      street: "",
    });
    this.deviceForm.markAsUntouched();
    this.deviceForm.markAsPristine();
    this.detailsNetworkDevice.set(null);
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.messageService.showMessage(message, "error");
    this.toaster.error("Something went wrong!");
  }

  viewOnMap(device: any): void {
    // Your logic here
    console.log("Viewing on map");
  }

  ngOnDestroy() {
    console.log("Component DESTROYED Install Camaera");
    // This shouldn't log when navigating away if reuse is working
  }
}
