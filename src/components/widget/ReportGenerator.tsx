/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import logo from '../../../public/Gabon-flag.png'; // Adjust path to your logo

interface ReportGeneratorProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  reportTitle: string;
  reportSubtitle?: string;
  reportDescription?: string;
  totalField?: keyof T;
  currency?: string;
}

export function ReportGenerator<T>({
  data,
  columns,
  reportTitle,
  reportSubtitle,
  reportDescription,
  totalField,
  currency = 'USD',
}: ReportGeneratorProps<T>) {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2025, i, 1), 'MMMM')
  );

  const filteredData = useMemo(() => {
    if (!selectedMonth && !dateRange.from && !dateRange.to) return data;

    return data.filter((item: any) => {
      const itemDate = new Date(item.createdAt || item.visitDate);
      let isInMonth = true;
      let isInRange = true;

      if (selectedMonth) {
        const monthIndex = months.indexOf(selectedMonth);
        const start = startOfMonth(new Date(2025, monthIndex, 1));
        const end = endOfMonth(new Date(2025, monthIndex, 1));
        isInMonth = isWithinInterval(itemDate, { start, end });
      }

      if (dateRange.from && dateRange.to) {
        isInRange = isWithinInterval(itemDate, {
          start: dateRange.from,
          end: dateRange.to,
        });
      }

      return isInMonth && isInRange;
    });
  }, [data, selectedMonth, dateRange]);

  const total = useMemo(() => {
    if (!totalField) return null;
    return filteredData.reduce((sum, item: any) => sum + (item[totalField] || 0), 0);
  }, [filteredData, totalField]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yOffset = 10;

    // Adding logo
    doc.addImage(logo, 'PNG', margin, yOffset, 40, 20);
    yOffset += 25;

    // Header Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('National Park System', pageWidth - margin - 60, yOffset);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Park Avenue, Nature City, NC 12345', pageWidth - margin - 60, yOffset + 5);
    doc.text('Phone: (123) 456-7890 | Email: info@parksystem.org', pageWidth - margin - 60, yOffset + 10);
    yOffset += 20;

    // Report Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, margin, yOffset);
    yOffset += 10;

    // Report Subtitle
    if (reportSubtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text(reportSubtitle, margin, yOffset);
      yOffset += 10;
    }

    // Report Description
    if (reportDescription) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitDesc = doc.splitTextToSize(reportDescription, pageWidth - 2 * margin);
      doc.text(splitDesc, margin, yOffset);
      yOffset += splitDesc.length * 5 + 5;
    }

    // Period Information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const periodText = selectedMonth
      ? `Period: ${selectedMonth} 2025`
      : dateRange.from && dateRange.to
      ? `Period: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
      : 'Period: All Data';
    doc.text(periodText, margin, yOffset);
    yOffset += 10;

    // Table
    autoTable(doc, {
      startY: yOffset,
      head: [columns.map((col) => col.header as string)],
      body: filteredData.map((row: any) =>
        columns.map((col) => {
          const cell = col.cell ? col.cell({ row: { original: row, getValue: (key: string) => row[key] } }) : row[col.accessorKey as string];
          return typeof cell === 'string' ? cell : JSON.stringify(cell);
        })
      ),
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133], textColor: 255 },
      margin: { top: yOffset, left: margin, right: margin },
      didDrawPage: (data) => {
        // Footer with page number
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - margin - 20, pageHeight - margin);
      },
    });

    // Total Amount
    if (totalField && total !== null) {
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total ${totalField.toString()}: ${currency} ${total.toFixed(2)}`, margin, finalY);
    }

    doc.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
  };

  const generateExcel = () => {
    const worksheetData = filteredData.map((row: any) =>
      columns.reduce((obj, col) => {
        const key = col.accessorKey as string;
        const value = col.cell ? col.cell({ row: { original: row, getValue: (key: string) => row[key] } }) : row[key];
        return { ...obj, [col.header as string]: typeof value === 'string' ? value : JSON.stringify(value) };
      }, {})
    );

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportTitle);
    XLSX.writeFile(wb, `${reportTitle.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="flex items-center gap-4">
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Months</SelectItem>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !dateRange.from && !dateRange.to && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from && dateRange.to ? (
              `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`
            ) : (
              'Pick a date range'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Button onClick={generatePDF}>
        <Download className="mr-2 h-4 w-4" /> PDF
      </Button>
      <Button onClick={generateExcel}>
        <Download className="mr-2 h-4 w-4" /> Excel
      </Button>
    </div>
  );
}