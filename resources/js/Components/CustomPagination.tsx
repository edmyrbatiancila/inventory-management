import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink as PaginationLinkComponent,
  PaginationNext,
  PaginationPrevious,
} from '@/Components/ui/pagination';
import { PaginatedResponse, PaginationLink as PaginationLinkType } from '@/types';

interface CustomPaginationProps<T> {
  data: PaginatedResponse<T>;
  className?: string;
}

export default function CustomPagination<T>({ data, className }: CustomPaginationProps<T>) {
  if (data.last_page <= 1) return null;

  const renderPaginationLink = (link: PaginationLinkType, index: number) => {
    if (link.label === '&laquo; Previous') {
      return (
        <PaginationItem key={index}>
          {link.url ? (
            <PaginationPrevious>
              <Link href={link.url} preserveScroll />
            </PaginationPrevious>
          ) : (
            <PaginationPrevious className="pointer-events-none opacity-50" />
          )}
        </PaginationItem>
      );
    }

    if (link.label === 'Next &raquo;') {
      return (
        <PaginationItem key={index}>
          {link.url ? (
            <PaginationNext>
              <Link href={link.url} preserveScroll />
            </PaginationNext>
          ) : (
            <PaginationNext className="pointer-events-none opacity-50" />
          )}
        </PaginationItem>
      );
    }

    if (link.label === '...') {
      return (
        <PaginationItem key={index}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    return (
      <PaginationItem key={index}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {link.url ? (
            <PaginationLinkComponent isActive={link.active}>
              <Link href={link.url} preserveScroll>
                {link.label}
              </Link>
            </PaginationLinkComponent>
          ) : (
            <PaginationLinkComponent isActive={link.active}>
              {link.label}
            </PaginationLinkComponent>
          )}
        </motion.div>
      </PaginationItem>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <div className="text-sm text-muted-foreground">
        Showing {data.from} to {data.to} of {data.total} results
      </div>
      <Pagination>
        <PaginationContent>
          {data.links.map((link, index) => renderPaginationLink(link, index))}
        </PaginationContent>
      </Pagination>
    </motion.div>
  );
}