import { jsPDF } from "jspdf";
import { Document } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export const exportToPDF = (documents: Document[]) => {
  try {
    if (!documents || documents.length === 0) {
      toast.error("No hay documentos para exportar");
      return;
    }

    // Use A4 format for consistent sizing
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // A4 margins in mm
    const margin = 15;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);
    
    doc.setFontSize(18);
    doc.text("Reporte de Documentos", margin, 20);
    
    doc.setFontSize(12);
    doc.text(`Fecha: ${format(new Date(), "dd/MM/yyyy", { locale: es })}`, margin, 30);
    
    const headers = ["Número", "Tipo", "Fecha", "Cliente", "Estado", "Total"];
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    let yPos = 40;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 5, contentWidth, 10, "F");
    
    // Calculate column widths based on content width
    const colWidth = contentWidth / headers.length;
    
    // Draw headers at calculated positions
    headers.forEach((header, i) => {
      const xPos = margin + (colWidth * i) + (colWidth / 2);
      doc.text(header, xPos, yPos, { align: 'center' });
    });
    
    yPos += 10;
    
    doc.setTextColor(0, 0, 0);
    
    documents.forEach((document, index) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, yPos - 5, contentWidth, 10, "F");
      }
      
      // Determinar el estado del documento de manera segura
      const status = 
        document.status === "approved" 
          ? "Aprobado" 
          : document.status === "pending" 
            ? "Pendiente" 
            : "Borrador";
      
      // Formatear la fecha correctamente
      const date = document.date ? new Date(document.date).toLocaleDateString() : "N/A";
      
      // Formatear el total correctamente
      const total = new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'PAB'
      }).format(document.total || 0);
      
      // Obtener el número de documento con fallback
      const docNumber = document.documentNumber || document.number || `Doc-${index + 1}`;
      
      // Obtener el nombre del cliente de manera segura
      const customerName = document.customer && document.customer.name 
        ? document.customer.name.substring(0, 25) + (document.customer.name.length > 25 ? '...' : '')
        : "Cliente no especificado";
      
      // Draw cells at calculated positions
      const values = [
        docNumber,
        document.type === 'quote' ? 'Cotización' : 'Factura',
        date,
        customerName,
        status,
        total
      ];
      
      values.forEach((value, i) => {
        const xPos = margin + (colWidth * i) + (colWidth / 2);
        doc.text(value, xPos, yPos, { align: i === 3 ? 'left' : 'center' });
      });
      
      yPos += 10;
    });
    
    const filename = `Reporte_Documentos_${format(new Date(), "yyyyMMdd")}.pdf`;
    
    doc.save(filename);
    toast.success("Reporte exportado con éxito");
  } catch (error) {
    console.error("Error al exportar a PDF:", error);
    toast.error(`Error al exportar a PDF: ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
};

export const exportToCSV = (documents: Document[]) => {
  try {
    if (!documents || documents.length === 0) {
      toast.error("No hay documentos para exportar");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Número,Tipo,Fecha,Cliente,Empresa,Estado,Subtotal,Impuesto,Total\n";
    
    documents.forEach((doc, index) => {
      // Manejar valores nullish con fallbacks
      const docNumber = doc.documentNumber || doc.number || `Doc-${index + 1}`;
      const date = doc.date ? new Date(doc.date).toLocaleDateString() : "N/A";
      const status = 
        doc.status === "approved" 
          ? "Aprobado" 
          : doc.status === "pending" 
            ? "Pendiente" 
            : "Borrador";
      const type = doc.type === "quote" ? "Cotización" : "Factura";
      
      // Valores seguros para cliente y empresa
      const customerName = doc.customer?.name || "Cliente no especificado";
      const companyName = doc.customer?.company || "Empresa no especificada";
      
      // Valores numéricos seguros
      const subtotal = (doc.subtotal || 0).toFixed(2);
      const tax = (doc.tax || 0).toFixed(2);
      const total = (doc.total || 0).toFixed(2);
      
      const row = [
        docNumber,
        type,
        date,
        `"${customerName}"`,
        `"${companyName}"`,
        status,
        subtotal,
        tax,
        total
      ];
      
      csvContent += row.join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    const dateStr = format(new Date(), "yyyyMMdd");
    const filename = `Reporte_Documentos_${dateStr}.csv`;
    
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV exportado con éxito");
  } catch (error) {
    console.error("Error al exportar a CSV:", error);
    toast.error(`Error al exportar a CSV: ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
};
