
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterSummaryProps {
  filteredCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  isMobile: boolean;
}

const FilterSummary: React.FC<FilterSummaryProps> = ({
  filteredCount,
  hasActiveFilters,
  onResetFilters,
  isMobile
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <p className="text-sm text-muted-foreground">
        {filteredCount} documentos encontrados
      </p>
      
      {!isMobile && hasActiveFilters && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onResetFilters}
        >
          <X className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
};

export default FilterSummary;
