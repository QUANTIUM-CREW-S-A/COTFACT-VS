import { Document } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { exportMultipleDocumentsAsPDF } from "./pdfExport";

// Helper function to render a document to an HTML element
export const renderDocumentToElement = async (document: Document): Promise<HTMLDivElement> => {
  // Create a container for the document
  const container = document.createElement('div');
  container.className = 'document-container';
  container.style.width = '8.5in';
  container.style.position = 'relative';
  container.style.backgroundColor = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.padding = '0.5in';
  container.style.boxSizing = 'border-box';

  // Add document heading with logo placeholder
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.marginBottom = '20px';
  
  const logoPlaceholder = document.createElement('div');
  logoPlaceholder.style.width = '150px';
  logoPlaceholder.style.height = '60px';
  logoPlaceholder.style.backgroundColor = '#f0f0f0';
  logoPlaceholder.style.display = 'flex';
  logoPlaceholder.style.alignItems = 'center';
  logoPlaceholder.style.justifyContent = 'center';
  logoPlaceholder.textContent = 'LOGO';
  
  const docInfo = document.createElement('div');
  docInfo.style.textAlign = 'right';
  
  const docTypeEl = document.createElement('h2');
  docTypeEl.textContent = document.type === 'quote' ? 'COTIZACIÓN' : 'FACTURA';
  docTypeEl.style.margin = '0 0 5px 0';
  docTypeEl.style.color = '#2563eb';
  
  const docNumberEl = document.createElement('div');
  const docNumber = document.documentNumber || document.number || '---';
  docNumberEl.textContent = `#${docNumber}`;
  docNumberEl.style.fontWeight = 'bold';
  docNumberEl.style.fontSize = '14px';
  
  const dateEl = document.createElement('div');
  dateEl.textContent = `Fecha: ${format(new Date(document.date), 'dd/MM/yyyy', { locale: es })}`;
  dateEl.style.fontSize = '14px';
  
  docInfo.appendChild(docTypeEl);
  docInfo.appendChild(docNumberEl);
  docInfo.appendChild(dateEl);
  
  header.appendChild(logoPlaceholder);
  header.appendChild(docInfo);
  
  // Customer information
  const customerSection = document.createElement('div');
  customerSection.style.marginBottom = '20px';
  customerSection.style.padding = '15px';
  customerSection.style.backgroundColor = '#f9fafb';
  customerSection.style.borderRadius = '5px';
  
  const customerTitle = document.createElement('div');
  customerTitle.textContent = 'CLIENTE';
  customerTitle.style.fontWeight = 'bold';
  customerTitle.style.marginBottom = '8px';
  customerTitle.style.color = '#4b5563';
  
  const customerName = document.createElement('div');
  customerName.textContent = document.customer?.name || 'Cliente no especificado';
  customerName.style.fontWeight = 'bold';
  customerName.style.fontSize = '16px';
  
  const customerCompany = document.createElement('div');
  if (document.customer?.company) {
    customerCompany.textContent = document.customer.company;
  }
  
  const customerEmail = document.createElement('div');
  if (document.customer?.email) {
    customerEmail.textContent = document.customer.email;
  }
  
  const customerPhone = document.createElement('div');
  if (document.customer?.phone) {
    customerPhone.textContent = document.customer.phone;
  }
  
  customerSection.appendChild(customerTitle);
  customerSection.appendChild(customerName);
  if (document.customer?.company) customerSection.appendChild(customerCompany);
  if (document.customer?.email) customerSection.appendChild(customerEmail);
  if (document.customer?.phone) customerSection.appendChild(customerPhone);
  
  // Items table
  const itemsSection = document.createElement('div');
  itemsSection.style.marginBottom = '20px';
  
  const itemsTable = document.createElement('table');
  itemsTable.style.width = '100%';
  itemsTable.style.borderCollapse = 'collapse';
  
  const tableHeader = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.backgroundColor = '#f3f4f6';
  
  const headers = ['Producto/Servicio', 'Cantidad', 'Precio', 'Total'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.padding = '10px';
    th.style.textAlign = headerText === 'Producto/Servicio' ? 'left' : 'right';
    headerRow.appendChild(th);
  });
  
  tableHeader.appendChild(headerRow);
  itemsTable.appendChild(tableHeader);
  
  const tableBody = document.createElement('tbody');
  
  (document.items || []).forEach(item => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #e5e7eb';
    
    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = item.description;
    descriptionCell.style.padding = '10px';
    
    const quantityCell = document.createElement('td');
    quantityCell.textContent = item.quantity.toString();
    quantityCell.style.padding = '10px';
    quantityCell.style.textAlign = 'right';
    
    const priceCell = document.createElement('td');
    priceCell.textContent = `$${item.price.toFixed(2)}`;
    priceCell.style.padding = '10px';
    priceCell.style.textAlign = 'right';
    
    const totalCell = document.createElement('td');
    totalCell.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
    totalCell.style.padding = '10px';
    totalCell.style.textAlign = 'right';
    totalCell.style.fontWeight = 'bold';
    
    row.appendChild(descriptionCell);
    row.appendChild(quantityCell);
    row.appendChild(priceCell);
    row.appendChild(totalCell);
    
    tableBody.appendChild(row);
  });
  
  itemsTable.appendChild(tableBody);
  itemsSection.appendChild(itemsTable);
  
  // Totals section
  const totalsSection = document.createElement('div');
  totalsSection.style.marginLeft = 'auto';
  totalsSection.style.width = '250px';
  totalsSection.style.marginBottom = '20px';
  
  const subtotalRow = document.createElement('div');
  subtotalRow.style.display = 'flex';
  subtotalRow.style.justifyContent = 'space-between';
  subtotalRow.style.padding = '5px 0';
  subtotalRow.style.borderBottom = '1px solid #e5e7eb';
  
  const subtotalLabel = document.createElement('div');
  subtotalLabel.textContent = 'Subtotal:';
  
  const subtotalValue = document.createElement('div');
  subtotalValue.textContent = `$${document.subtotal.toFixed(2)}`;
  
  subtotalRow.appendChild(subtotalLabel);
  subtotalRow.appendChild(subtotalValue);
  
  const taxRow = document.createElement('div');
  taxRow.style.display = 'flex';
  taxRow.style.justifyContent = 'space-between';
  taxRow.style.padding = '5px 0';
  taxRow.style.borderBottom = '1px solid #e5e7eb';
  
  const taxLabel = document.createElement('div');
  taxLabel.textContent = 'Impuesto:';
  
  const taxValue = document.createElement('div');
  taxValue.textContent = `$${document.tax.toFixed(2)}`;
  
  taxRow.appendChild(taxLabel);
  taxRow.appendChild(taxValue);
  
  const totalRow = document.createElement('div');
  totalRow.style.display = 'flex';
  totalRow.style.justifyContent = 'space-between';
  totalRow.style.padding = '10px 0';
  totalRow.style.fontWeight = 'bold';
  totalRow.style.fontSize = '16px';
  
  const totalLabel = document.createElement('div');
  totalLabel.textContent = 'Total:';
  
  const totalValue = document.createElement('div');
  totalValue.textContent = `$${document.total.toFixed(2)}`;
  
  totalRow.appendChild(totalLabel);
  totalRow.appendChild(totalValue);
  
  totalsSection.appendChild(subtotalRow);
  totalsSection.appendChild(taxRow);
  totalsSection.appendChild(totalRow);
  
  // Terms and conditions
  if (document.termsAndConditions && document.termsAndConditions.length > 0) {
    const termsSection = document.createElement('div');
    termsSection.style.marginTop = '30px';
    termsSection.style.borderTop = '1px solid #e5e7eb';
    termsSection.style.paddingTop = '15px';
    
    const termsTitle = document.createElement('h3');
    termsTitle.textContent = 'Términos y Condiciones';
    termsTitle.style.fontSize = '14px';
    termsTitle.style.marginBottom = '10px';
    
    termsSection.appendChild(termsTitle);
    
    const termsList = document.createElement('ul');
    termsList.style.fontSize = '12px';
    termsList.style.color = '#4b5563';
    termsList.style.paddingLeft = '20px';
    
    document.termsAndConditions.forEach(term => {
      const termItem = document.createElement('li');
      termItem.textContent = term;
      termItem.style.marginBottom = '5px';
      termsList.appendChild(termItem);
    });
    
    termsSection.appendChild(termsList);
    container.appendChild(termsSection);
  }
  
  // Assemble the document
  container.appendChild(header);
  container.appendChild(customerSection);
  container.appendChild(itemsSection);
  container.appendChild(totalsSection);
  
  return container;
};

// Export multiple actual documents as a single PDF
export const exportDocumentsAsPDF = async (documents: Document[]) => {
  if (!documents || documents.length === 0) {
    toast.error("No hay documentos para exportar");
    return;
  }
  
  try {
    await exportMultipleDocumentsAsPDF(documents, renderDocumentToElement);
  } catch (error) {
    console.error("Error al exportar documentos como PDF:", error);
    toast.error(`Error al exportar: ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
};

export const exportToPDF = async (documents: Document[]) => {
  try {
    if (!documents || documents.length === 0) {
      toast.error("No hay documentos para exportar");
      return;
    }

    toast.info("Generando PDF, por favor espere...");

    // Dynamically import jsPDF
    const { jsPDF } = await import("jspdf");

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
