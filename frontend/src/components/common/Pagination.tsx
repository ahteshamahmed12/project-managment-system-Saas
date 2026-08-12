import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;

  const end = Math.min(page * pageSize, totalItems);

  if (totalPages <= 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-border bg-card px-6 py-4 sm:flex-row">
      {/* Record Information */}

      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}</span> -{" "}
        <span className="font-medium text-foreground">{end}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span>{" "}
        records
      </p>

      {/* Pagination Controls */}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        {Array.from({
          length: totalPages,
        }).map((_, index) => {
          const pageNumber = index + 1;

          return (
            <Button
              key={pageNumber}
              size="icon"
              variant={pageNumber === page ? "default" : "outline"}
              onClick={() => onPageChange(pageNumber)}
              className={
                pageNumber === page
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : ""
              }
            >
              {pageNumber}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
