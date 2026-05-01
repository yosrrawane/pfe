export enum Role {
  ADMIN = 'ADMIN',
  MEDECIN = 'MEDECIN',
  TECHNICIEN = 'TECHNICIEN'
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  isActive?: boolean;
  password?: string;
}
