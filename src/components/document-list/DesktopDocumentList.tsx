
import React from "react";
import { Document } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import StatusBadge from "./StatusBadge";
import ListActions from "./ListActions";

interface DesktopDocumentListProps {
  documents: Document[];
  type: "quote" | "invoice";
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  onConvert?: (id: string) => void;
}

const DesktopDocumentList: React.FC<DesktopDocumentListProps> = ({ 
  documents, 
  type, 
  onDelete, 
  onApprove, 
  onConvert 
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No hay {type === "quote" ? "cotizaciones" : "facturas"} disponibles.
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.documentNumber}</TableCell>
                <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="font-medium">{doc.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{doc.customer.company}</div>
                </TableCell>
                <TableCell className="text-right">${doc.total.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={doc.status} />
                </TableCell>
                <TableCell className="text-right">
                  <ListActions 
                    document={doc} 
                    type={type} 
                    onDelete={onDelete} 
                    onApprove={onApprove} 
                    onConvert={onConvert} 
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DesktopDocumentList;
