
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Document } from "@/types";

interface StatusBadgeProps {
  status: Document["status"];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-300";
      case "rejected": return "bg-red-100 text-red-800 border-red-300";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusText = (status: Document["status"]) => {
    switch (status) {
      case "approved": return "Aprobado";
      case "rejected": return "Rechazado";
      case "pending": return "Pendiente";
      default: return "Borrador";
    }
  };

  return (
    <Badge className={`font-normal ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </Badge>
  );
};

export default StatusBadge;
