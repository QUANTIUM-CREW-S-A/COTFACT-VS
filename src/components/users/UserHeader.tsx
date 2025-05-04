
import React from "react";
import { Users2 } from "lucide-react";

interface UserHeaderProps {
  title: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ title }) => {
  return (
    <div className="flex items-center">
      <Users2 className="mr-2 h-5 w-5 text-blue-600" />
      <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {title}
      </h1>
    </div>
  );
};

export default UserHeader;
