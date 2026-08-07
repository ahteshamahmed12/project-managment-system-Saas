import * as React from "react";

interface SearchFilterBarProps {
  children: React.ReactNode;
}

export default function SearchFilterBar({ children }: SearchFilterBarProps) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {children}
      </div>
    </div>
  );
}
