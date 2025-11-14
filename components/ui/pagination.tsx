import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Pagination({ className, children, ...props }: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="pagination navigation"
      className={cn('flex w-full justify-center', className)}
      {...props}
    >
      {children}
    </nav>
  );
}

export interface PaginationItemProps
  extends React.LiHTMLAttributes<HTMLLIElement> {}

function PaginationItem({ className, ...props }: PaginationItemProps) {
  return <li className={cn('inline-block', className)} {...props} />;
}

export { Pagination, PaginationItem };
