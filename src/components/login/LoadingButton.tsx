
import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface LoadingButtonProps {
  type?: "button" | "submit" | "reset";
  isLoading: boolean;
  icon: LucideIcon;
  loadingText: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  type = "submit",
  isLoading,
  icon: Icon,
  loadingText,
  disabled,
  children,
  className,
}) => {
  return (
    <Button
      type={type}
      className={className}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          <span>{loadingText}</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <Icon className="h-5 w-5" />
          <span>{children}</span>
        </span>
      )}
    </Button>
  );
};

export default LoadingButton;
