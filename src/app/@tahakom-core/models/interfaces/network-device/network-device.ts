// network-device.interface.ts
export interface INetworkDevice {
  id: number;
  type: "camera" | "sensor" | "router" | "other";
  ipAddress: string;
  cameraId?: string;
  username?: string;
  password?: string;
  fps?: string;
  city?: string;
  director?: string;
  latitude: number;
  longitude: number;
  street?: string;
  status: "online" | "offline" | "maintenance";
  createdAt?: Date;
  updatedAt?: Date;
}

// Form interface that matches your form controls
export interface DeviceFormValues {
  type: "camera" | "sensor" | "router" | "other";
  cameraId: string | null;
  ipAddress: string | null;
  username: string | null;
  password: string | null;
  fps: string | null;
  city: string | null;
  director: string | null;
  latitude: number | null;
  longitude: number | null;
  street: string | null;
}
