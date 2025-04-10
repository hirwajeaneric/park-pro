"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchParks } from "@/store/slices/adminSlice";
import { useAuth } from "@/hooks/useAuth";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import BreadcrumbWithCustomSeparator, { BreadCrumLinkTypes } from "@/components/widget/BreadCrumComponent";
import { RootState } from "@/store";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Park {
  id: string;
  name: string;
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Custom DataTable component with server-side pagination support
function ParksDataTable({
  columns,
  data,
  isLoading,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
}: {
  columns: ColumnDef<Park>[];
  data: Park[];
  isLoading: boolean;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: currentPage,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // Enable manual pagination for server-side
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center gap-2">
        <Input
          placeholder="Search by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data.length} of {totalElements} parks
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ParksPage() {
  const { accessToken } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const { parks, loading } = useSelector((state: RootState) => state.admin);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (accessToken) {
      console.log("Token: ", accessToken);
      dispatch(fetchParks({token: accessToken}));
    }
  }, [accessToken, dispatch, page]);

  const columns: ColumnDef<Park>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/parks/details/${row.original.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const breadCrumLinks: BreadCrumLinkTypes[] = [{ label: "Parks", link: "/admin/parks", position: "end" }];

  // Assuming the API returns pagination data in the format you provided
  const totalElements = 4; // This should come from the API response
  const totalPages = Math.ceil(totalElements / pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-18">
        <BreadcrumbWithCustomSeparator breadCrumLinks={breadCrumLinks} />
        <h1 className="mt-6 font-bold text-3xl">Parks</h1>
        <div className="mt-6">
          <Button
            className="mb-4"
            onClick={() => router.push("/admin/parks/new")}
          >
            Add New Park
          </Button>
          <ParksDataTable
            columns={columns}
            data={parks}
            isLoading={loading}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}