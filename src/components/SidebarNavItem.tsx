import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItemProps {
  to?: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  badge?: number | string;
}

const SidebarNavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  isActive = false,
  collapsed = false,
  onClick,
  badge,
}) => {
  // Variants for button hover animation - más sutil
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.01, transition: { duration: 0.15 } }
  };

  // Indicador de elemento activo - más sutil y moderno
  const activeClasses = isActive 
    ? 'border-l-[3px] border-primary bg-primary/8 dark:bg-primary/10 text-primary' 
    : 'border-l-[3px] border-transparent text-foreground/80';

  // Common content to render
  const content = (
    <motion.div
      className={`w-full ${activeClasses} rounded-sm overflow-hidden`}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
    >
      <Button 
        variant="ghost" 
        className={`w-full justify-start rounded-md py-2 h-auto ${
          collapsed ? 'px-2' : 'px-3'
        } ${isActive 
          ? 'font-medium' 
          : 'hover:bg-accent/50 hover:text-foreground'
        } ${collapsed ? 'justify-center' : ''}`}
        size="sm"
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} w-full`}>
          <span className={`${isActive ? 'text-primary' : 'text-muted-foreground/90'} flex-shrink-0`}>
            {icon}
          </span>
          
          {!collapsed && (
            <span className={`${isActive ? 'text-primary' : ''} text-sm`}>
              {label}
            </span>
          )}
          
          {badge && !collapsed && (
            <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-primary/15 text-primary">
              {badge}
            </span>
          )}
        </div>
      </Button>
    </motion.div>
  );

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          {to ? (
            <Link to={to} className="block">
              {content}
            </Link>
          ) : (
            <div onClick={onClick} className="cursor-pointer">
              {content}
            </div>
          )}
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="bg-popover/95 backdrop-blur-sm border-border">
            <div className="flex items-center gap-2">
              <span>{label}</span>
              {badge && (
                <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary/15 text-primary">
                  {badge}
                </span>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default SidebarNavItem;
