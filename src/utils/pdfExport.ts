import { Document } from "@/types";
import { toast } from "sonner";

export const exportDocumentAsPDF = async (document: Document, documentRef: React.RefObject<HTMLDivElement>) => {
  try {
    if (!documentRef.current) {
      toast.error("No se pudo encontrar el documento para exportar");
      return;
    }

    toast.info("Generando PDF, por favor espere...");
    
    // Dynamically import the required libraries
    const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas")
    ]);
    
    // Get the document element that we want to capture
    const documentElement = documentRef.current;
    
    // Add a temporary class for proper PDF sizing
    documentElement.classList.add("pdf-exporting");
    
    // Create the canvas from the document element
    const canvas = await html2canvas(documentElement, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });
    
    // Remove temporary class after capture
    documentElement.classList.remove("pdf-exporting");
    
    // Letter size dimensions: 8.5x11 inches in points (72 points per inch)
    const pageWidth = 8.5;
    const pageHeight = 11;
    
    // Create PDF in letter size
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [pageWidth, pageHeight]
    });
    
    // Calculate the dimensions to fit content properly on the page
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Canvas aspect ratio
    const canvasAspectRatio = canvas.width / canvas.height;
    // Page aspect ratio
    const pageAspectRatio = pageWidth / pageHeight;
    
    let finalImgWidth, finalImgHeight, xOffset, yOffset;
    
    // If the content is taller than the page, scale it to fit the page height
    // and center it horizontally
    if (canvasAspectRatio < pageAspectRatio) {
      finalImgHeight = pageHeight - 0.5; // Leave small margins
      finalImgWidth = finalImgHeight * canvasAspectRatio;
      xOffset = (pageWidth - finalImgWidth) / 2;
      yOffset = 0.25; // Small top margin
    } 
    // If the content is wider than the page, scale it to fit the page width
    // and center it vertically
    else {
      finalImgWidth = pageWidth - 0.5; // Leave small margins
      finalImgHeight = finalImgWidth / canvasAspectRatio;
      xOffset = 0.25; // Small left margin
      yOffset = (pageHeight - finalImgHeight) / 2;
    }
    
    // Add image to PDF with proper positioning
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", xOffset, yOffset, finalImgWidth, finalImgHeight);
    
    // Safe access to document number with fallback
    const documentNumber = document.documentNumber || 
                           document.number || 
                           `Doc-${new Date().getTime().toString().slice(-6)}`;
    
    // Save the PDF with a meaningful name
    const docTypeName = document.type === "quote" ? "Cotizacion" : "Factura";
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    pdf.save(`${docTypeName}_${documentNumber}_${dateStr}.pdf`);
    
    toast.success("PDF generado con éxito");
  } catch (error) {
    console.error("Error al generar PDF:", error);
    toast.error("Error al generar el PDF: " + (error instanceof Error ? error.message : "Error desconocido"));
  }
};

// New function to export multiple documents as a single PDF file
export const exportMultipleDocumentsAsPDF = async (documents: Document[], renderDocumentFunction: (doc: Document) => Promise<HTMLDivElement>) => {
  try {
    if (!documents || documents.length === 0) {
      toast.error("No hay documentos para exportar");
      return;
    }

    toast.info(`Generando PDF con ${documents.length} documentos, por favor espere...`);
    
    // Dynamically import the required libraries
    const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas")
    ]);
    
    // Letter size dimensions: 8.5x11 inches in points (72 points per inch)
    const pageWidth = 8.5;
    const pageHeight = 11;
    
    // Create PDF in letter size
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [pageWidth, pageHeight]
    });

    let isFirstPage = true;
    
    // Process each document
    for (const [index, document] of documents.entries()) {
      // Update progress
      if (index > 0 && index % 5 === 0) {
        toast.info(`Procesando documentos (${index}/${documents.length})...`);
      }
      
      // Render the document to a DOM element
      const documentElement = await renderDocumentFunction(document);
      
      // Add a temporary class for proper PDF sizing
      documentElement.classList.add("pdf-exporting");
      
      // Temporarily add to DOM to render
      documentElement.style.visibility = 'hidden';
      document.body.appendChild(documentElement);
      
      // Create the canvas from the document element
      const canvas = await html2canvas(documentElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
      
      // Clean up
      documentElement.classList.remove("pdf-exporting");
      document.body.removeChild(documentElement);
      
      // Add a new page for each document (except the first one)
      if (!isFirstPage) {
        pdf.addPage();
      } else {
        isFirstPage = false;
      }
      
      // Canvas aspect ratio
      const canvasAspectRatio = canvas.width / canvas.height;
      // Page aspect ratio
      const pageAspectRatio = pageWidth / pageHeight;
      
      let finalImgWidth, finalImgHeight, xOffset, yOffset;
      
      // If the content is taller than the page, scale it to fit the page height
      if (canvasAspectRatio < pageAspectRatio) {
        finalImgHeight = pageHeight - 0.5; // Leave small margins
        finalImgWidth = finalImgHeight * canvasAspectRatio;
        xOffset = (pageWidth - finalImgWidth) / 2;
        yOffset = 0.25; // Small top margin
      } 
      // If the content is wider than the page, scale it to fit the page width
      else {
        finalImgWidth = pageWidth - 0.5; // Leave small margins
        finalImgHeight = finalImgWidth / canvasAspectRatio;
        xOffset = 0.25; // Small left margin
        yOffset = (pageHeight - finalImgHeight) / 2;
      }
      
      // Add image to PDF with proper positioning
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalImgWidth, finalImgHeight);
    }
    
    // Save the PDF with a meaningful name
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    pdf.save(`Documentos_Exportados_${dateStr}.pdf`);
    
    toast.success(`${documents.length} documentos exportados con éxito`);
  } catch (error) {
    console.error("Error al generar PDF múltiple:", error);
    toast.error("Error al generar los PDFs: " + (error instanceof Error ? error.message : "Error desconocido"));
  }
};

// Modified function to toggle the letter-size preview mode with better mobile support
export const toggleLetterPreview = (documentRef: React.RefObject<HTMLDivElement>) => {
  if (!documentRef.current) return;
  
  const content = documentRef.current;
  const card = content.closest('.card') || content.parentElement;
  
  if (!card) return;
  
  const existingPreview = document.querySelector('.letter-preview-container');
  
  if (existingPreview) {
    // Remove preview mode
    const originalContent = existingPreview.querySelector('.letter-preview-content');
    if (originalContent) {
      card.innerHTML = '';
      card.appendChild(originalContent.cloneNode(true));
    }
    existingPreview.remove();
    return false;
  } else {
    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'letter-preview-container';
    
    // Create inner container with letter dimensions
    const letterPreview = document.createElement('div');
    letterPreview.className = 'letter-preview';
    
    // Create content container
    const previewContent = document.createElement('div');
    previewContent.className = 'letter-preview-content';
    previewContent.innerHTML = content.innerHTML;
    
    // Add pinch-zoom support for mobile
    if (window.innerWidth < 768) {
      previewContent.style.touchAction = 'manipulation';
      
      let initialScale = 1;
      let currentScale = 1;
      
      previewContent.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
          initialScale = currentScale;
        }
      });
      
      previewContent.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
          e.preventDefault();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          
          const distance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          
          const initialDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          
          currentScale = initialScale * (distance / initialDistance);
          currentScale = Math.min(Math.max(currentScale, 0.5), 3);
          
          previewContent.style.transform = `scale(${currentScale})`;
        }
      });
    }
    
    // Build the preview
    letterPreview.appendChild(previewContent);
    previewContainer.appendChild(letterPreview);
    
    // Replace content with preview
    card.innerHTML = '';
    card.appendChild(previewContainer);
    return true;
  }
};
