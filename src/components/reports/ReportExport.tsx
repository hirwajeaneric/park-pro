'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DateRange } from 'react-day-picker';

interface Column {
    label: string;
    value: string;
}

interface ReportExportProps {
    title: string;
    subtitle?: string;
    description?: string;
    columns: Column[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    fileName?: string;
}

export default function ReportExport({
    title,
    subtitle,
    description,
    columns,
    data,
    fileName = 'report'
}: ReportExportProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');

    const getFilteredData = () => {
        let filteredData = [...data];
        
        if (dateRange?.from && dateRange?.to) {
            filteredData = filteredData.filter(item => {
                const itemDate = new Date(item.createdAt);
                return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
            });
        }
        
        if (selectedMonth && selectedMonth !== 'all') {
            filteredData = filteredData.filter(item => {
                const itemDate = new Date(item.createdAt);
                return itemDate.getMonth() === parseInt(selectedMonth);
            });
        }
        
        if (selectedYear && selectedYear !== 'all') {
            filteredData = filteredData.filter(item => {
                const itemDate = new Date(item.createdAt);
                return itemDate.getFullYear() === parseInt(selectedYear);
            });
        }
        
        return filteredData;
    };

    const generateExcel = () => {
        const filteredData = getFilteredData();
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const generatePDF = async () => {
        try {
            const filteredData = getFilteredData();

            if (!filteredData || filteredData.length === 0) {
                throw new Error('No data available to export');
            }

            const doc = new jsPDF();

            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            let yPosition = 30;

            // Add text-based logo
            doc.setFontSize(32);
            doc.setTextColor(0, 158, 96); // Green
            doc.text('Park', margin, yPosition);
            doc.setTextColor(252, 209, 22); // Yellow
            // Calculate the width of "Park" to position "Pro" right after it
            const parkWidth = doc.getTextWidth('Park');
            doc.text('Pro', margin + parkWidth, yPosition);
            
            // Add a decorative line under the logo
            doc.setDrawColor(58, 117, 196); // Blue
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition + 2, margin + parkWidth + doc.getTextWidth('Pro'), yPosition + 2);

            // Add company info on the right
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0); // Reset to black
            doc.text('ParkPro', pageWidth - margin - 60, yPosition);
            yPosition += 5;
            doc.text('13493, Rue du Gouverneur Balley', pageWidth - margin - 60, yPosition);
            yPosition += 5;
            doc.text('Libreville, Gabon', pageWidth - margin - 60, yPosition);
            yPosition += 5;
            doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth - margin - 60, yPosition);

            // Move down for title and subtitle
            yPosition += 20;

            // Add title
            doc.setFontSize(20);
            doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            // Add subtitle if exists
            if (subtitle) {
                doc.setFontSize(16);
                doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' });
                yPosition += 5;
            }

            // Add description if exists
            if (description) {
                doc.setFontSize(12);
                const splitDescription = doc.splitTextToSize(description, pageWidth - (margin * 2));
                doc.text(splitDescription, margin, yPosition);
                yPosition += splitDescription.length * 7;
            }

            // Add table
            const tableColumn = columns.map(col => col.label);

            const tableRows = filteredData.map(item => {
                try {
                    return columns.map(col => {
                        const value = item[col.value];
                        if (value === undefined || value === null) {
                            return '';
                        }
                        if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                            return format(new Date(value), 'MMM dd, yyyy');
                        }
                        if (typeof value === 'number') {
                            return value.toLocaleString();
                        }
                        return String(value);
                    });
                } catch (error) {
                    console.error('Error processing row:', error);
                    return columns.map(() => '');
                }
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: yPosition + 10,
                margin: { left: margin },
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [58, 117, 196], // Blue
                    textColor: 255,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                },
            });

            doc.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('Detailed error in PDF generation:', error);
            alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange?.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All months</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                                {format(new Date(2024, i), 'MMMM')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All years</SelectItem>
                        {Array.from({ length: 5 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button onClick={generatePDF} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                    <Button onClick={generateExcel} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                </div>
            </div>
        </div>
    );
}