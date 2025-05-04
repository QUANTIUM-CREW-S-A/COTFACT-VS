
import React from 'react';

interface TermsAndConditionsSectionProps {
  terms: string[];
  themeColor: string;
}

const TermsAndConditionsSection: React.FC<TermsAndConditionsSectionProps> = ({ terms, themeColor }) => {
  return (
    <div className="mb-8">
      <h3 className={`font-bold mb-2 ${themeColor} text-sm`}>Términos y Condiciones</h3>
      <ul className="list-disc list-inside text-xs space-y-1">
        {terms.map((term, index) => (
          <li key={index}>{term}</li>
        ))}
      </ul>
    </div>
  );
};

export default TermsAndConditionsSection;
