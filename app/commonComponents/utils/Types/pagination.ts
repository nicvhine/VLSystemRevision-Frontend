export interface PaginationProps {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
    language: 'en' | 'ceb';
  }
  
  export interface FilterProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    sortBy: string;
    setSortBy: (val: string) => void;
    sortOptions: { value: string; label: string }[];
    t?: any;
    isMobile?: boolean;
    onSearchChange?: (val: string) => void;
    onSortChange?: (val: string) => void;
  }
  