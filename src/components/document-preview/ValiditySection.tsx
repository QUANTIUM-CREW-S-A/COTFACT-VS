
import React from 'react';

interface ValiditySectionProps {
  validDays: number;
  themeColor: string;
}

const ValiditySection: React.FC<ValiditySectionProps> = ({ validDays, themeColor }) => {
  return (
    <div className={`text-center ${themeColor} font-bold text-xs sm:text-sm my-2 sm:my-4 px-2 break-words`}>
      *ESTA COTIZACIÓN ES VÁLIDA DURANTE LOS {validDays} DÍAS DEL MES CORRESPONDIENTE*
    </div>
  );
};

export default ValiditySection;
