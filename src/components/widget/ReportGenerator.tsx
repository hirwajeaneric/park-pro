"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { BookingResponse, DonationResponse } from "@/types";

// Assuming logoImage is provided as a base64 string or URL (replace with actual logo)
const logoImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="; // Placeholder base64 logo
const companyDetails = {
  name: "ParkPro",
  address: "123 Nature Lane, Green City, GC 12345",
  phone: "+250 788 123 456",
  email: "info@parkpro.com",
  website: "www.parkpro.com",
};

interface ReportGeneratorProps<T> {
  data: T[];
  dataType: "bookings" | "donations";
  onFilterChange?: (filteredData: T[]) => void;
}

export default function ReportGenerator<T extends { amount: number; createdAt: string }>({
  data,
  dataType,
  onFilterChange,
}: ReportGeneratorProps<T>) {
  const [filterType, setFilterType] = useState<"month" | "dateRange">("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const filterData = () => {
    let filteredData = [...data];
    if (filterType === "month") {
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getMonth() + 1 === selectedMonth && itemDate.getFullYear() === new Date().getFullYear();
      });
    } else if (filterType === "dateRange") {
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      });
    }
    if (onFilterChange) onFilterChange(filteredData);
    return filteredData;
  };

  const generatePDF = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    const filteredData = filterData();
    const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);

    // Add logo and company details
    doc.addImage(logoImage, "PNG", 10, 10, 30, 20);
    doc.setFontSize(12);
    doc.text(`${companyDetails.name}`, 50, 20);
    doc.text(`Address: ${companyDetails.address}`, 50, 30);
    doc.text(`Phone: ${companyDetails.phone}`, 50, 40);
    doc.text(`Email: ${companyDetails.email}`, 50, 50);
    doc.text(`Website: ${companyDetails.website}`, 50, 60);

    // Title
    doc.setFontSize(18);
    doc.text(
      `${dataType === "bookings" ? "Booking" : "Donation"} Report - ${filterType === "month" ? format(new Date(selectedMonth + "/1/" + new Date().getFullYear()), "MMMM yyyy") : `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`}`,
      10,
      80
    );

    // Table data
    const tableData = filteredData.map((item) => {
      const itemDate = new Date(item.createdAt);
      return {
        ID: (item as any).id || (item as any).donorId,
        Amount: `${item.amount} ${companyDetails.currency || "USD"}`,
        Date: format(itemDate, "MMM dd, yyyy"),
        Status: (item as any).status || "N/A",
        ...(dataType === "bookings" && { "Number of Tickets": (item as BookingResponse).numberOfTickets }),
        ...(dataType === "bookings" && {
          "Group Members": (item as BookingResponse).groupMembers
            .map((m) => m.guestName || `Guest ${((item as BookingResponse).groupMembers.indexOf(m) + 1)}`)
            .join(", ") || "N/A",
        }),
        ...(dataType === "donations" && { Donor: (item as DonationResponse).donorName || "N/A" }),
        ...(dataType === "donations" && { Motive: (item as DonationResponse).motiveForDonation || "N/A" }),
      };
    });

    doc.autoTable({
      startY: 90,
      head: [Object.keys(tableData[0] || {})],
      body: tableData.map(Object.values),
      didDrawPage: (data) => {
        doc.text(`Page ${data.pageNumber} of ${Math.ceil(tableData.length / 10)}`, 200, 285);
      },
    });

    // Total
    doc.text(`Total Amount: ${totalAmount.toFixed(2)} ${companyDetails.currency || "USD"}`, 10, doc.lastAutoTable.finalY + 10);

    doc.save(`${dataType}-report-${new Date().toISOString().split("T")[0]}.pdf`);
    setIsGenerating(false);
  };

  const generateExcel = () => {
    setIsGenerating(true);
    const filteredData = filterData();
    const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);

    const wsData = [
      ["Report Type", `${dataType === "bookings" ? "Booking" : "Donation"} Report`],
      ["Date Range", filterType === "month" ? format(new Date(selectedMonth + "/1/" + new Date().getFullYear()), "MMMM yyyy") : `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`],
      ["Company", companyDetails.name],
      ["Address", companyDetails.address],
      ["Phone", companyDetails.phone],
      ["Email", companyDetails.email],
      ["Website", companyDetails.website],
      [],
      ...(dataType === "bookings"
        ? [["ID", "Amount", "Visit Date", "Status", "Number of Tickets", "Group Members"]]
        : [["ID", "Amount", "Created At", "Status", "Donor", "Motive"]]),
      ...filteredData.map((item) => {
        const itemDate = new Date(item.createdAt);
        return [
          (item as any).id || (item as any).donorId,
          `${item.amount} ${companyDetails.currency || "USD"}`,
          format(itemDate, "MMM dd, yyyy"),
          (item as any).status || "N/A",
          ...(dataType === "bookings"
            ? [(item as BookingResponse).numberOfTickets, (item as BookingResponse).groupMembers.map((m) => m.guestName || `Guest ${((item as BookingResponse).groupMembers.indexOf(m) + 1)}`).join(", ") || "N/A"]
            : [(item as DonationResponse).donorName || "N/A", (item as DonationResponse).motiveForDonation || "N/A"]),
        ];
      }),
      [],
      ["Total Amount", `${totalAmount.toFixed(2)} ${companyDetails.currency || "USD"}"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `${dataType}-report-${new Date().toISOString().split("T")[0]}.xlsx`);
    setIsGenerating(false);
  };

  const filteredData = filterData();
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex items-center space-x-2">
      <Select value={filterType} onValueChange={(value) => setFilterType(value as "month" | "dateRange")}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Filter By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="dateRange">Date Range</SelectItem>
        </SelectContent>
      </Select>
      {filterType === "month" ? (
        <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month.toString()}>{format(new Date(0, month - 1), "MMMM")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => setDateRange({ from: range?.from || new Date(), to: range?.to || addDays(new Date(), 7) })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
      <Button onClick={generatePDF} disabled={isGenerating}>
        {isGenerating ? "Generating PDF..." : "Download PDF"}
      </Button>
      <Button onClick={generateExcel} disabled={isGenerating}>
        {isGenerating ? "Generating Excel..." : "Download Excel"}
      </Button>
    </div>
  );
}