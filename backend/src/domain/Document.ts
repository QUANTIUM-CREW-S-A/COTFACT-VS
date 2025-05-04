// Definir la entidad Document para representar los documentos en el dominio

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}