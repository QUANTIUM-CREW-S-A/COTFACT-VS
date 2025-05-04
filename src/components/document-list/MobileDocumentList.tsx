
import React from "react";
import { Document } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";
import ListActions from "./ListActions";

interface MobileDocumentListProps {
  documents: Document[];
  type: "quote" | "invoice";
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  onConvert?: (id: string) => void;
}

const MobileDocumentList: React.FC<MobileDocumentListProps> = ({ 
  documents, 
  type, 
  onDelete, 
  onApprove, 
  onConvert 
}) => {
  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <Card>
          <CardContent className="text-center p-6">
            <p className="text-muted-foreground">
              No hay {type === "quote" ? "cotizaciones" : "facturas"} disponibles.
            </p>
          </CardContent>
        </Card>
      ) : (
        documents.map((doc) => (
          <Card key={doc.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex justify-between items-start p-4 border-b">
                <div>
                  <div className="font-medium">{doc.documentNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(doc.date).toLocaleDateString()}
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>
              
              <div className="p-4">
                <div className="font-medium">{doc.customer.name}</div>
                <div className="text-sm text-muted-foreground mb-2">{doc.customer.company}</div>
                <div className="text-right font-semibold">${doc.total.toFixed(2)}</div>
              </div>
              
              <ListActions 
                document={doc} 
                type={type} 
                onDelete={onDelete} 
                onApprove={onApprove} 
                onConvert={onConvert} 
                isMobile={true} 
              />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default MobileDocumentList;
