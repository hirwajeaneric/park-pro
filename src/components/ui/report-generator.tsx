/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ui/report-generator.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { format, isValid, parseISO } from "date-fns";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Define the structure for column configuration
export interface ReportColumnConfig<T> {
  key: keyof T; // The key from your data object
  title: string; // The header title for the report table
  type?: 'string' | 'number' | 'date' | 'currency' | 'badge'; // Helps with formatting
  badgeMap?: Record<string, string>; // For 'badge' type, map value to color/variant if needed
}

// Props for the ReportGenerator component
interface ReportGeneratorProps<T> {
  data: T[]; // The raw data array
  columnsConfig: ReportColumnConfig<T>[]; // Configuration for the table columns
  reportTitle: string;
  reportSubtitle?: string;
  descriptionText?: string;
  totalCalculator?: (filteredData: T[]) => number | string; // Function to calculate a total
  fileName?: string; // Base name for the downloaded file
  logoSrc?: string; // URL to the system logo
  systemName?: string; // Name of the system/company
  systemAddress?: string; // Address for the PDF header
  systemContact?: string; // Contact info for the PDF header
  // Callback to signal the parent about filtered data change (useful if parent needs to re-fetch)
  onFilteredDataChange?: (filteredData: T[], startDate?: Date, endDate?: Date) => void;
  // Prop to determine if filtering UI should be shown (default to true)
  enableFiltering?: boolean;
}

// Helper to determine the start and end of a month
const getMonthDateRange = (year: number, monthIndex: number) => {
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0); // Last day of the month
  return { startDate, endDate };
};

export function ReportGenerator<T>({
  data,
  columnsConfig,
  reportTitle,
  reportSubtitle,
  descriptionText,
  totalCalculator,
  fileName = 'report',
  logoSrc = '/images/system-logo.png', // Default logo path
  systemName = 'ParkPro System',
  systemAddress = 'Kigali, Rwanda',
  systemContact = '+250 788 123 456 | info@parkpro.com',
  onFilteredDataChange,
  enableFiltering = true,
}: ReportGeneratorProps<T>) {
  const [filterType, setFilterType] = useState<'month' | 'range' | 'none'>('none');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  );
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 31 }, (_, i) => 2000 + i); // 2000 to 2030
  const months = Array.from({ length: 12 }, (_, i) => i); // 0-11 for months

  // Filtered data based on selected criteria
  const filteredData = useMemo(() => {
    if (filterType === 'none' || !enableFiltering) {
      return data;
    }

    return data.filter(item => {
      // Assuming createdAt is the relevant date field for filtering
      const itemDateString = (item as any).createdAt || (item as any).visitDate;
      if (!itemDateString) return true; // Include if no date field for filtering

      const itemDate = parseISO(itemDateString);
      if (!isValid(itemDate)) return false;

      if (filterType === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        return itemDate.getFullYear() === year && itemDate.getMonth() === (month - 1);
      } else if (filterType === 'range' && dateRange?.from && dateRange?.to) {
        const from = new Date(dateRange.from.setHours(0, 0, 0, 0));
        const to = new Date(dateRange.to.setHours(23, 59, 59, 999));
        return itemDate >= from && itemDate <= to;
      }
      return true;
    });
  }, [data, filterType, selectedMonth, dateRange, enableFiltering]);

  // Notify parent component about filtered data changes
  useEffect(() => {
    if (onFilteredDataChange) {
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (filterType === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        const range = getMonthDateRange(year, month - 1);
        startDate = range.startDate;
        endDate = range.endDate;
      } else if (filterType === 'range' && dateRange?.from && dateRange?.to) {
        startDate = dateRange.from;
        endDate = dateRange.to;
      }
      onFilteredDataChange(filteredData, startDate, endDate);
    }
  }, [filteredData, onFilteredDataChange, filterType, selectedMonth, dateRange]);


  const getReportPeriodText = useCallback(() => {
    if (filterType === 'none' || !enableFiltering) {
      return 'All Data';
    } else if (filterType === 'month') {
      const [year, month] = selectedMonth.split('-').map(Number);
      return `For: ${format(new Date(year, month - 1, 1), 'MMMM yyyy')}`;
    } else if (filterType === 'range' && dateRange?.from && dateRange?.to) {
      return `From: ${format(dateRange.from, 'MMM dd, yyyy')} To: ${format(dateRange.to, 'MMM dd, yyyy')}`;
    }
    return '';
  }, [filterType, selectedMonth, dateRange, enableFiltering]);

  const generatePdf = useCallback(() => {
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: reportTitle,
      subject: reportSubtitle,
      author: systemName,
      creator: systemName,
    });

    let yOffset = 20; // Starting Y position

    // Header with Logo and Company Info
    if (logoSrc) {
      const img = new Image();
      img.src = logoSrc;
      img.onload = () => {
        const imgWidth = 20; // Adjust as needed
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(img, 'PNG', 15, 10, imgWidth, imgHeight);
        
        doc.setFontSize(10);
        doc.text(systemName, 40, 15);
        doc.text(systemAddress, 40, 20);
        doc.text(systemContact, 40, 25);

        // Report Title and Subtitle
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(reportTitle, 105, 40, { align: 'center' });
        if (reportSubtitle) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'normal');
          doc.text(reportSubtitle, 105, 47, { align: 'center' });
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(getReportPeriodText(), 105, 54, { align: 'center' });

        yOffset = 65; // Adjust Y for content after header

        if (descriptionText) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const splitDescription = doc.splitTextToSize(descriptionText, 180); // Max width 180mm
          doc.text(splitDescription, 15, yOffset);
          yOffset += (splitDescription.length * 5) + 5; // Add line height and some padding
        }

        // Table headers and rows
        const tableColumnTitles = columnsConfig.map(col => col.title);
        const tableRows = filteredData.map(item =>
          columnsConfig.map(col => {
            const value = item[col.key];
            if (col.type === 'date' && isValid(new Date(value as string))) {
              return format(new Date(value as string), 'MMM dd, yyyy');
            }
            if (col.type === 'currency' && typeof value === 'number') {
              return `${value.toFixed(2)}`; // Format as currency, assuming no symbol yet
            }
            if (col.type === 'badge' && col.badgeMap) {
                // Return raw value, handle badge styling in autoTable hook if possible or simplify
                return String(value).toUpperCase();
            }
            return String(value || ''); // Ensure string
          })
        );

        autoTable(doc, {
          startY: yOffset,
          head: [tableColumnTitles],
          body: tableRows,
          theme: 'striped', // 'striped', 'grid', 'plain'
          headStyles: { fillColor: '#3B82F6', textColor: '#FFFFFF', fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
          columnStyles: {
            // Example: aligning specific columns
            0: { cellWidth: 'auto' }, // Example for the first column
          },
          didDrawPage: (data) => {
            // Footer: Page Number
            const str = 'Page ' + (doc.internal.getNumberOfPages());
            doc.setFontSize(8);
            doc.text(str, doc.internal.pageSize.width - 15, doc.internal.pageSize.height - 10, { align: 'right' });

            // Footer: Date and Time
            doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, doc.internal.pageSize.height - 10);
          },
        });

        // Add Total if calculator is provided
        if (totalCalculator) {
          const total = totalCalculator(filteredData);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Total: ${total}`, 15, (doc as any).lastAutoTable.finalY + 10);
        }

        doc.save(`${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
      };
      img.onerror = () => {
        // Fallback if logo fails to load
        console.error('Failed to load logo, generating PDF without it.');
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(reportTitle, 105, 40, { align: 'center' });
        // Re-run the rest of the PDF generation without the image onload block
        generatePdfContentWithoutLogo(doc, yOffset);
      };
    } else {
      // If no logoSrc is provided, generate content directly
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(reportTitle, 105, 40, { align: 'center' });
      generatePdfContentWithoutLogo(doc, yOffset);
    }
  }, [
    filteredData,
    columnsConfig,
    reportTitle,
    reportSubtitle,
    descriptionText,
    totalCalculator,
    fileName,
    logoSrc,
    systemName,
    systemAddress,
    systemContact,
    getReportPeriodText,
  ]);

  const generatePdfContentWithoutLogo = useCallback((doc: jsPDF, initialYOffset: number) => {
    let yOffset = initialYOffset;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, 105, 40, { align: 'center' });
    if (reportSubtitle) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(reportSubtitle, 105, 47, { align: 'center' });
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(getReportPeriodText(), 105, 54, { align: 'center' });

    yOffset = 65;

    if (descriptionText) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitDescription = doc.splitTextToSize(descriptionText, 180);
      doc.text(splitDescription, 15, yOffset);
      yOffset += (splitDescription.length * 5) + 5;
    }

    const tableColumnTitles = columnsConfig.map(col => col.title);
    const tableRows = filteredData.map(item =>
      columnsConfig.map(col => {
        const value = item[col.key];
        if (col.type === 'date' && isValid(new Date(value as string))) {
          return format(new Date(value as string), 'MMM dd, yyyy');
        }
        if (col.type === 'currency' && typeof value === 'number') {
          return `${value.toFixed(2)}`;
        }
        if (col.type === 'badge' && col.badgeMap) {
            return String(value).toUpperCase();
        }
        return String(value || '');
      })
    );

    autoTable(doc, {
      startY: yOffset,
      head: [tableColumnTitles],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: '#3B82F6', textColor: '#FFFFFF', fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      didDrawPage: (data) => {
        const str = 'Page ' + (doc.internal.getNumberOfPages());
        doc.setFontSize(8);
        doc.text(str, doc.internal.pageSize.width - 15, doc.internal.pageSize.height - 10, { align: 'right' });
        doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 15, doc.internal.pageSize.height - 10);
      },
    });

    if (totalCalculator) {
      const total = totalCalculator(filteredData);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${total}`, 15, (doc as any).lastAutoTable.finalY + 10);
    }

    doc.save(`${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
  }, [
    filteredData,
    columnsConfig,
    reportTitle,
    reportSubtitle,
    descriptionText,
    totalCalculator,
    fileName,
    getReportPeriodText,
  ]);


  const generateExcel = useCallback(() => {
    const ws_data: any[][] = [];

    // Add header info
    ws_data.push([systemName]);
    ws_data.push([systemAddress]);
    ws_data.push([systemContact]);
    ws_data.push([]); // Empty row
    ws_data.push([reportTitle]);
    if (reportSubtitle) ws_data.push([reportSubtitle]);
    ws_data.push([getReportPeriodText()]);
    if (descriptionText) ws_data.push([descriptionText]);
    ws_data.push([]); // Empty row

    // Table Headers
    ws_data.push(columnsConfig.map(col => col.title));

    // Table Rows
    filteredData.forEach(item => {
      const rowData = columnsConfig.map(col => {
        const value = item[col.key];
        if (col.type === 'date' && isValid(new Date(value as string))) {
          return format(new Date(value as string), 'yyyy-MM-dd');
        }
        if (col.type === 'currency' && typeof value === 'number') {
          return value.toFixed(2);
        }
        if (col.type === 'badge') {
            return String(value).toUpperCase();
        }
        return String(value || '');
      });
      ws_data.push(rowData);
    });

    // Add Total if calculator is provided
    if (totalCalculator) {
      const total = totalCalculator(filteredData);
      ws_data.push([]); // Empty row
      ws_data.push(['Total:', total]);
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
  }, [
    filteredData,
    columnsConfig,
    reportTitle,
    reportSubtitle,
    descriptionText,
    totalCalculator,
    fileName,
    systemName,
    systemAddress,
    systemContact,
    getReportPeriodText,
  ]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Export <Download className="ml-2 h-4 w-4" /> <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h4 className="font-semibold mb-3">Export Options</h4>

        {enableFiltering && (
          <div className="mb-4 space-y-2">
            <h5 className="text-sm font-medium">Filter by:</h5>
            <Select value={filterType} onValueChange={(value: 'month' | 'range' | 'none') => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Filter</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="range">Date Range</SelectItem>
              </SelectContent>
            </Select>

            {filterType === 'month' && (
              <div className="flex space-x-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <optgroup key={year} label={String(year)}>
                        {months.map(monthIndex => (
                          <SelectItem
                            key={`${year}-${monthIndex + 1}`}
                            value={`${year}-${(monthIndex + 1).toString().padStart(2, '0')}`}
                          >
                            {format(new Date(year, monthIndex, 1), 'MMMM yyyy')}
                          </SelectItem>
                        ))}
                      </optgroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filterType === 'range' && (
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            )}
          </div>
        )}

        <div className="grid gap-2">
          <Button onClick={generatePdf} className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Generate PDF
          </Button>
          <Button onClick={generateExcel} className="flex items-center">
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Generate Excel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}