'use client';

import { useRef } from 'react';
import { format } from 'date-fns';
import { Button } from './button';
import { Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReceiptData {
  id: string;
  type: 'FUNDING_REQUEST' | 'WITHDRAW_REQUEST' | 'EXPENSE';
  title: string;
  amount: string;
  currency: string;
  status: string;
  parkName: string;
  parkLocation?: string;
  category: string;
  reason: string;
  createdAt: string;
  approvedAt?: string;
  approvedAmount?: string;
  requesterName?: string;
  approverName?: string;
  receiptNumber?: string;
}

interface ReceiptGeneratorProps {
  data: ReceiptData;
  onPrint?: () => void;
  onDownload?: () => void;
  showActions?: boolean;
}

export function ReceiptGenerator({ data, onPrint, onDownload, showActions = true }: ReceiptGeneratorProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const generatePDF = async (): Promise<jsPDF | null> => {
    if (!receiptRef.current) {
      console.error('Receipt element not found');
      return null;
    }

    try {
      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.fontSize = '14px';
      tempContainer.style.lineHeight = '1.5';
      tempContainer.style.color = 'black';

      // Clone the receipt content
      const receiptClone = receiptRef.current.cloneNode(true) as HTMLElement;
      
      // Remove any action buttons from the clone
      const actionButtons = receiptClone.querySelector('.receipt-actions');
      if (actionButtons) {
        actionButtons.remove();
      }

      // Apply PDF-specific styles to the clone
      receiptClone.style.width = '100%';
      receiptClone.style.margin = '0';
      receiptClone.style.padding = '0';
      receiptClone.style.backgroundColor = 'white';
      receiptClone.style.color = 'black';
      receiptClone.style.border = 'none';
      receiptClone.style.borderRadius = '0';
      receiptClone.style.boxShadow = 'none';

      // Add the clone to the temporary container
      tempContainer.appendChild(receiptClone);
      document.body.appendChild(tempContainer);

      // Wait a bit for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Clean up
      document.body.removeChild(tempContainer);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if content fits on one page
      if (imgHeight <= pdfHeight - 20) {
        // Single page
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      } else {
        // Multiple pages
        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - 20);
        }
      }

      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };

  const handlePrint = async () => {
    if (onPrint) {
      onPrint();
      return;
    }

    try {
      const pdf = await generatePDF();
      if (pdf) {
        // Open PDF in new window for printing
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl);
        
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        // Clean up URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
      } else {
        // Fallback to browser print
        window.print();
      }
    } catch (error) {
      console.error('Error printing:', error);
      // Fallback to browser print
      window.print();
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      const pdf = await generatePDF();
      if (pdf) {
        const fileName = `receipt-${data.id}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        pdf.save(fileName);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback to HTML download
      try {
        const receiptContent = receiptRef.current?.innerHTML;
        if (receiptContent) {
          const blob = new Blob([receiptContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `receipt-${data.id}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PASSED':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'REJECTED':
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FUNDING_REQUEST':
        return 'Funding Request Receipt';
      case 'WITHDRAW_REQUEST':
        return 'Withdrawal Receipt';
      case 'EXPENSE':
        return 'Expense Receipt';
      default:
        return 'Receipt';
    }
  };

  return (
    <div className="space-y-4">
      {showActions && (
        <div className="flex gap-2 receipt-actions">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      )}
      
      <div 
        ref={receiptRef}
        className="receipt-container bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto print:p-8 print:border-none"
        style={{ 
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">PARK PRO</h1>
          <p className="text-gray-600 text-sm">Financial Management System</p>
          <p className="text-gray-600 text-sm mt-1">{getTypeLabel(data.type)}</p>
        </div>

        {/* Receipt Number and Date */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-gray-600">Receipt #: {data.receiptNumber || data.id}</p>
            <p className="text-sm text-gray-600">Date: {format(new Date(data.createdAt), 'MMMM dd, yyyy')}</p>
            {data.approvedAt && (
              <p className="text-sm text-gray-600">Approved: {format(new Date(data.approvedAt), 'MMMM dd, yyyy')}</p>
            )}
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(data.status)}`}>
              {data.status}
            </span>
          </div>
        </div>

        {/* Park Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Park Information</h3>
          <p className="text-sm text-gray-700"><strong>Name:</strong> {data.parkName}</p>
          {data.parkLocation && (
            <p className="text-sm text-gray-700"><strong>Location:</strong> {data.parkLocation}</p>
          )}
        </div>

        {/* Transaction Details */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Transaction Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{data.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Requested Amount:</span>
              <span className="font-medium">{data.currency} {parseFloat(data.amount).toFixed(2)}</span>
            </div>
            {data.approvedAmount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Approved Amount:</span>
                <span className="font-medium">{data.currency} {parseFloat(data.approvedAmount).toFixed(2)}</span>
              </div>
            )}
            {data.requesterName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Requested By:</span>
                <span className="font-medium">{data.requesterName}</span>
              </div>
            )}
            {data.approverName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Approved By:</span>
                <span className="font-medium">{data.approverName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Reason</h3>
          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{data.reason}</p>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8">
          <div className="text-center text-sm text-gray-600">
            <p>This is an official document generated by Park Pro Financial Management System</p>
            <p className="mt-1">Generated on {format(new Date(), 'MMMM dd, yyyy at HH:mm')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptGenerator; 