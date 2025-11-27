import { memo, useMemo } from "react";
import { Button } from "./ui/button";

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 5;

function getPageRange(
  currentPage: number,
  totalPages: number,
): { startPage: number; endPage: number } {
  const halfVisible = Math.floor(MAX_VISIBLE_PAGES / 2);
  const endPage = Math.min(
    totalPages,
    Math.max(1, currentPage - halfVisible) + MAX_VISIBLE_PAGES - 1,
  );
  const startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);

  return { startPage, endPage };
}

const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { startPage, endPage, pages } = useMemo(() => {
    if (totalPages <= 0) {
      return { startPage: 1, endPage: 1, pages: [] };
    }
    const range = getPageRange(currentPage, totalPages);
    const pageNumbers = Array.from(
      { length: range.endPage - range.startPage + 1 },
      (_, i) => range.startPage + i,
    );
    return { ...range, pages: pageNumbers };
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  const showFirstPage = startPage > 1;
  const showFirstEllipsis = startPage > 2;
  const showLastPage = endPage < totalPages;
  const showLastEllipsis = endPage < totalPages - 1;

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-8"
      aria-label="Pagination"
    >
      <Button
        variant="secondary"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showFirstPage && (
        <Button variant="secondary" onClick={() => onPageChange(1)}>
          1
        </Button>
      )}
      {showFirstEllipsis && (
        <span className="text-muted-foreground" aria-hidden="true">
          ...
        </span>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "secondary"}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? "bg-gradient-primary" : ""}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Button>
      ))}

      {showLastEllipsis && (
        <span className="text-muted-foreground" aria-hidden="true">
          ...
        </span>
      )}
      {showLastPage && (
        <Button variant="secondary" onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </Button>
      )}

      <Button
        variant="secondary"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
});

export default Pagination;
