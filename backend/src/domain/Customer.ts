// Definir la entidad Customer para el dominio de la aplicación

export interface Address {
  company?: string;
  location?: string;
}

export interface Customer {
  id?: string;
  user_id: string;
  name: string;
  address: Address;
  phone: string;
  email: string;
  type?: 'individual' | 'business';
  createdAt?: Date;
  updatedAt?: Date;
}