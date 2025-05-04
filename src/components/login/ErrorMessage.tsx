
import React from "react";

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 flex items-start">
      <div className="bg-red-100 p-1 rounded-full mr-2 mt-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-600">
          <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
        </svg>
      </div>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
