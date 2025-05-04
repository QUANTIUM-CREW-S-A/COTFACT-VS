
import { Document, CompanyInfo } from "@/types";

export const defaultCompanyInfo: CompanyInfo = {
  name: "VIANG SOLUTION & SERVICE",
  ruc: "8-711-875",
  dv: "74",
  contactName: "Vionel Angulo",
  phone: "(+507) 6734 0816",
  email: "vionel@viangsolution.com",
  address: "Domingo Díaz Calle 18 Local 18-D",
  logo: "/lovable-uploads/bb00fdf0-74ae-4881-9051-ebb67356e959.png"
};

export const defaultTermsAndConditions = [
  "El 50% del monto total debe abonarse al aprobar la cotización.",
  "El saldo restante debe ser pagado al momento de la entrega del producto o finalización del servicio.",
  "El cliente acepta la cotización al realizar el primer pago mencionado en los términos.",
  "Cualquier cambio en los requerimientos después de aprobada la cotización podrá generar un costo adicional."
];

export const defaultPaymentMethods = [
  {
    bank: "BANCO GENERAL",
    accountHolder: "Vionel Angulo",
    accountNumber: "04-42-01-021721-1",
    accountType: "AHORRO"
  }
];

export const mockDocuments: Document[] = [
  {
    id: "1",
    documentNumber: "COT-2024-001",
    date: "2024-04-12",
    customer: {
      id: "c1",
      name: "Juan Perez",
      company: "Empresa ABC",
      location: "Ciudad de Panamá",
      phone: "+507 6123 4567",
      type: "person"
    },
    items: [
      {
        id: "1",
        description: "Limpieza y mantenimiento de oficina",
        quantity: 1,
        unitPrice: 250,
        total: 250
      },
      {
        id: "2",
        description: "Reparación de equipo informático",
        quantity: 2,
        unitPrice: 75,
        total: 150
      }
    ],
    subtotal: 400,
    tax: 28,
    total: 428,
    status: "pending",
    type: "quote",
    validDays: 15,
    termsAndConditions: defaultTermsAndConditions,
    paymentMethods: defaultPaymentMethods,
    createdAt: "2024-04-12",
    updatedAt: "2024-04-12"
  },
  {
    id: "2",
    documentNumber: "FAC-2024-001",
    date: "2024-04-10",
    customer: {
      id: "c2",
      name: "María González",
      company: "Tienda XYZ",
      location: "David, Chiriquí",
      phone: "+507 6987 6543",
      type: "business"
    },
    items: [
      {
        id: "1",
        description: "Instalación de sistema de seguridad",
        quantity: 1,
        unitPrice: 500,
        total: 500
      }
    ],
    subtotal: 500,
    tax: 35,
    total: 535,
    status: "approved",
    type: "invoice",
    validDays: 15,
    termsAndConditions: defaultTermsAndConditions,
    paymentMethods: defaultPaymentMethods,
    createdAt: "2024-04-10",
    updatedAt: "2024-04-10"
  }
];

export const mockCustomers = [
  {
    id: "c1",
    name: "Juan Pérez",
    company: "Empresa Ejemplo S.A.",
    location: "Ciudad de Panamá",
    phone: "+507 1234-5678",
    email: "juan@ejemplo.com",
    type: "business"
  },
  {
    id: "c2",
    name: "María González",
    company: "Consultoría MGC",
    location: "Colón",
    phone: "+507 8765-4321",
    email: "maria@mgc.com",
    type: "business"
  },
  {
    id: "c3",
    name: "Roberto Díaz",
    company: "N/A",
    location: "David, Chiriquí",
    phone: "+507 5555-1234",
    email: "roberto@gmail.com",
    type: "person"
  }
];
