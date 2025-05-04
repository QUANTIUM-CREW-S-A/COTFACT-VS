
import React from 'react';
import { LineItem } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface ItemsTableProps {
  items: LineItem[];
  themeColor: string;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ items, themeColor }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="overflow-hidden mb-8">
        <h3 className={`text-base font-semibold mb-3 ${themeColor}`}>Detalle de Productos/Servicios</h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="border rounded-lg p-4 text-sm shadow-sm bg-white"
            >
              <div className="font-medium mb-3 break-words text-base">{item.description}</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="block text-xs text-gray-500 mb-1">Precio</span>
                  <span className="font-medium">${item.unitPrice.toFixed(2)}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="block text-xs text-gray-500 mb-1">Cantidad</span>
                  <span className="font-medium">{item.quantity}</span>
                </div>
                <div className={`bg-gray-50 p-3 rounded-md`}>
                  <span className="block text-xs text-gray-500 mb-1">Total</span>
                  <span className={`font-medium ${themeColor}`}>${item.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mb-8">
      <table className="w-full min-w-[400px] mb-0 text-sm">
        <thead>
          <tr className={`border-b ${themeColor}`}>
            <th className="text-left py-2 px-2 w-[45%]">DESCRIPCIÓN</th>
            <th className="text-center py-2 px-1 w-[18%]">P/U</th>
            <th className="text-center py-2 px-1 w-[12%]">UNI.</th>
            <th className="text-right py-2 px-2 w-[25%]">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2 px-2 break-words">{item.description}</td>
              <td className="py-2 px-1 text-center">${item.unitPrice.toFixed(2)}</td>
              <td className="py-2 px-1 text-center">{item.quantity}</td>
              <td className="py-2 px-2 text-right">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;
