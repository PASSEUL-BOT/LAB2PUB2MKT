import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className={`w-full text-left text-sm ${className}`} {...props} />
    </div>
  );
}

export function Thead({ ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-paper text-slate" {...props} />;
}

export function Th({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-4 py-2.5 font-medium ${className}`} {...props} />;
}

export function Td({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`border-t border-line px-4 py-2.5 ${className}`} {...props} />;
}
