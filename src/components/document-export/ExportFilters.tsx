
import React from "react";
import { Filter, X, CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExportFiltersProps {
  documentType: "all" | "quote" | "invoice";
  setDocumentType: (value: "all" | "quote" | "invoice") => void;
  documentStatus: "all" | "approved" | "pending" | "draft";
  setDocumentStatus: (value: "all" | "approved" | "pending" | "draft") => void;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setDateRange: React.Dispatch<React.SetStateAction<{
    from: Date | undefined;
    to: Date | undefined;
  }>>;
  resetFilters: () => void;
}

const ExportFilters: React.FC<ExportFiltersProps> = ({
  documentType,
  setDocumentType,
  documentStatus,
  setDocumentStatus,
  dateRange,
  setDateRange,
  resetFilters,
}) => {
  const isMobile = useIsMobile();
  const hasActiveFilters = documentType !== "all" || documentStatus !== "all" || dateRange.from || dateRange.to;

  // Mobile view with accordion
  if (isMobile) {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger className="py-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">Activos</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Documento</label>
                <Select
                  value={documentType}
                  onValueChange={(value) => setDocumentType(value as "all" | "quote" | "invoice")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="quote">Cotizaciones</SelectItem>
                    <SelectItem value="invoice">Facturas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select
                  value={documentStatus}
                  onValueChange={(value) => setDocumentStatus(value as "all" | "approved" | "pending" | "draft")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="approved">Aprobados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="draft">Borradores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DateRangeSelector 
                dateRange={dateRange} 
                setDateRange={setDateRange} 
                isMobile={true} 
              />
              
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="w-full mt-2"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  // Desktop view
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Tipo de Documento</label>
        <Select
          value={documentType}
          onValueChange={(value) => setDocumentType(value as "all" | "quote" | "invoice")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="quote">Cotizaciones</SelectItem>
            <SelectItem value="invoice">Facturas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Estado</label>
        <Select
          value={documentStatus}
          onValueChange={(value) => setDocumentStatus(value as "all" | "approved" | "pending" | "draft")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="approved">Aprobados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DateRangeSelector 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        isMobile={false} 
      />
    </div>
  );
};

// Sub-component for date range selection
interface DateRangeSelectorProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setDateRange: React.Dispatch<React.SetStateAction<{
    from: Date | undefined;
    to: Date | undefined;
  }>>;
  isMobile: boolean;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ dateRange, setDateRange, isMobile }) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Rango de Fechas</label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                !dateRange.from ? "text-muted-foreground" : ""
              }`}
            >
              <CalendarRange className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                "Seleccionar fechas"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={(range) => {
                if (range) {
                  setDateRange({ 
                    from: range.from || undefined, 
                    to: range.to || undefined 
                  });
                } else {
                  setDateRange({ from: undefined, to: undefined });
                }
              }}
              numberOfMonths={isMobile ? 1 : 2}
              locale={es}
            />
          </PopoverContent>
        </Popover>
        
        {(dateRange.from || dateRange.to) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDateRange({ from: undefined, to: undefined })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExportFilters;
