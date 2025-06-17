export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  city: string[];
  area: string[];
  token?: string;
  refreshToken?: string;
  roles?: string[];
}
