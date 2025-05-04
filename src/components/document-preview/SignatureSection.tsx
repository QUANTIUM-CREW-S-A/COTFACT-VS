
import React from 'react';

const SignatureSection: React.FC = () => {
  return (
    <div className="flex justify-between mt-10 mb-4">
      <div className="w-1/3 border-t pt-2 text-center">
        <p className="text-xs">____________________</p>
        <p className="text-xs font-bold">CLIENTE</p>
      </div>
      <div className="w-1/3 border-t pt-2 text-center">
        <p className="text-xs">____________________</p>
        <p className="text-xs font-bold">VIONEL ANGULO</p>
      </div>
    </div>
  );
};

export default SignatureSection;
