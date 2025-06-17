import { Injectable, inject, computed } from "@angular/core";
import { INetworkDevice } from "@models/interfaces/network-device/network-device";
import { HttpResourceService } from "@services/utilities/http-calls/http-calls-observable.service";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class NetworkDeviceService {
  private httpResource = inject(HttpResourceService);

  // State keys
  private readonly KEYS = {
    list: "network-devices-list",
    detail: (id: number) => `network-device-${id}`,
    create: "network-device-create",
    update: "network-device-update",
    delete: "network-device-delete",
  };

  // Resolver configurations
  static readonly RESOLVERS = {
    // Load all network devices
    networkDevicesList: {
      url: "networkDevices",
      key: "network-devices-list",
    },
    // Load single network device by ID from route params
    networkDeviceDetail: {
      url: "networkDevices",
      getFromParams: true,
      key: "network-device-detail",
    },
    // Load both network devices list and specific device
    networkDevicesWithDetail: [
      {
        url: "networkDevices",
        key: "network-devices-list",
      },
      {
        url: "networkDevices",
        getFromParams: true,
        key: "network-device-detail",
      },
    ],
    // Load all network devices
    cameraTypesList: {
      url: "cameraTypes",
      key: "camera-types-list",
    },
  };

  // State accessors
  readonly listState = computed(() =>
    this.httpResource.getState<INetworkDevice[]>(this.KEYS.list)
  );
  readonly createState = computed(() =>
    this.httpResource.getState<INetworkDevice>(this.KEYS.create)
  );

  // Convenience getters
  readonly networkDevices = computed(() => this.listState().data() || []);
  readonly loading = computed(() => this.listState().loading());
  readonly error = computed(() => this.listState().error());

  /**
   * Get all network devices
   */
  getAll(): Observable<INetworkDevice[]> {
    return this.httpResource.request<INetworkDevice[]>(
      "GET",
      "networkDevices",
      {
        key: this.KEYS.list,
      }
    );
  }

  /**
   * Get network device by ID
   */
  getById(id: number): Observable<INetworkDevice> {
    return this.httpResource.request<INetworkDevice>(
      "GET",
      `networkDevices/${id}`,
      {
        key: this.KEYS.detail(id),
      }
    );
  }

  /**
   * Create new network device
   */
  create(networkDevice: INetworkDevice): Observable<INetworkDevice> {
    return this.httpResource.request<INetworkDevice>("POST", "networkDevices", {
      body: networkDevice,
      key: this.KEYS.create,
    });
  }

  /**
   * Update network device
   */
  update(
    id: number,
    networkDevice: INetworkDevice
  ): Observable<INetworkDevice> {
    return this.httpResource.request<INetworkDevice>(
      "PUT",
      `networkDevices/${id}`,
      {
        body: networkDevice,
        key: this.KEYS.update,
      }
    );
  }

  /**
   * Delete network device
   */
  delete(id: number): Observable<void> {
    return this.httpResource.request<void>("DELETE", `networkDevices/${id}`, {
      key: this.KEYS.delete,
    });
  }

  /**
   * Get state for specific network device (works with resolver)
   */
  getNetworkDeviceState(id: number) {
    return this.httpResource.getState<INetworkDevice>(this.KEYS.detail(id));
  }

  /**
   * Get resolved network device detail state
   */
  getDetailState() {
    return this.httpResource.getState<INetworkDevice>("network-device-detail");
  }

  /**
   * Get camera types from API
   */
  getCameraTypes(): Observable<string[]> {
    return this.httpResource.request<string[]>("GET", "cameraTypes", {
      key: "cameraTypes",
    });
  }
}
