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
  // Add safety checks for malformed data
  if (!data || data.last_page <= 1 || !data.links || !Array.isArray(data.links)) {
    return null;
  }

  const renderPaginationLink = (link: PaginationLinkType, index: number) => {
    if (link.label === '&laquo; Previous') {
      return (
        <PaginationItem key={index}>
          {link.url ? (
            <Link href={link.url} preserveScroll>
              <PaginationPrevious />
            </Link>
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
            <Link href={link.url} preserveScroll>
              <PaginationNext />
            </Link>
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
            <Link href={link.url} preserveScroll>
              <PaginationLinkComponent isActive={link.active}>
                {link.label}
              </PaginationLinkComponent>
            </Link>
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
        Showing {data.from || 0} to {data.to || 0} of {data.total || 0} results
      </div>
      <Pagination>
        <PaginationContent>
          {(data.links || []).map((link, index) => renderPaginationLink(link, index))}
        </PaginationContent>
      </Pagination>
    </motion.div>
  );
}