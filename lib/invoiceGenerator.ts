
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from './types';
import { format } from 'date-fns';

export const generateInvoicePDF = (order: Order) => {
    const doc = new jsPDF();

    // Theme Colors (from globals.css)
    const colors = {
        background: '#F8F8F8', // --off-white
        card: '#FFFFFF',
        textPrimary: '#1C1C1C', // --smoky-black / --primary
        textSecondary: '#666666',
        border: '#DADADA', // --mist-grey
        accent: '#D4AF37', // Gold 
        tableHeader: '#1C1C1C',
        tableRowEven: '#FAFAFA'
    };

    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (margin * 2);

    // Helper for rounded rectangles (bg)
    const roundedBox = (x: number, y: number, w: number, h: number, color: string) => {
        doc.setFillColor(color);
        doc.roundedRect(x, y, w, h, 3, 3, 'F');
    };

    // --- Background ---
    // Make the whole page slightly off-white like the app body? 
    // Or keep white for printing. Let's stick to white for printability 
    // but add a container border.

    // Main Container Border
    doc.setDrawColor(colors.border);
    doc.setLineWidth(0.1);
    doc.roundedRect(margin, margin, contentWidth, pageHeight - (margin * 2), 5, 5, 'S');

    // --- Header Section ---
    const headerHeight = 40;
    // Light background for header
    roundedBox(margin + 2, margin + 2, contentWidth - 4, headerHeight, colors.background);

    // Logo / Brand
    doc.setTextColor(colors.textPrimary);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('THE BOTTLE STORIES', margin + 8, margin + 15);

    doc.setFontSize(9);
    doc.setTextColor(colors.textSecondary);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Inspired Perfumes', margin + 8, margin + 20);
    doc.text('www.thebottlestories.com', margin + 8, margin + 24);

    // INVOICE Label
    doc.setFontSize(28);
    doc.setTextColor(colors.accent);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin - 10, margin + 25, { align: 'right' });


    // --- Details Grid ---
    const yDetails = margin + headerHeight + 10;
    const col1X = margin + 5;
    const col2X = pageWidth / 2 + 10; // Moved right slightly for better separation

    // Left Column: Order Details
    const labelX = col1X;
    const valueX = col1X + 30; // Fixed width for labels

    doc.setFontSize(10);
    doc.setTextColor(colors.textSecondary);

    // Row 1
    doc.text('Invoice No:', labelX, yDetails);
    doc.setTextColor(colors.textPrimary);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${order._id.slice(-6).toUpperCase()}`, valueX, yDetails);

    // Row 2
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSecondary);
    doc.text('Date:', labelX, yDetails + 6);
    doc.setTextColor(colors.textPrimary);
    doc.setFont('helvetica', 'bold');
    doc.text(format(new Date(order.createdAt || order.created_at || new Date()), 'MMM dd, yyyy'), valueX, yDetails + 6);

    // Row 3 (Status)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSecondary);
    doc.text('Status:', labelX, yDetails + 12);

    const status = order.status.toUpperCase();
    let statusColor = colors.textPrimary;
    if (status === 'COMPLETED' || status === 'DELIVERED') statusColor = '#059669';
    else if (status === 'PENDING') statusColor = '#D97706';

    doc.setTextColor(statusColor);
    doc.setFont('helvetica', 'bold');
    doc.text(status, valueX, yDetails + 12);


    // Right Column: Bill To
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSecondary);
    doc.text('Bill To:', col2X, yDetails);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textPrimary);
    doc.text(order.customer_name, col2X, yDetails + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSecondary);
    const emailY = yDetails + 11;
    if (order.customer_email) {
        doc.text(order.customer_email, col2X, emailY);
    }

    let addressY = emailY + 5;
    if (order.shipping_address) {
        const addr = order.shipping_address;
        const addressText = [addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(', ');
        const addressLines = doc.splitTextToSize(addressText, (contentWidth / 2) - 15); // Slightly narrower to avoid edge
        doc.text(addressLines, col2X, addressY);
        addressY += (addressLines.length * 4);
    } else if (order.customer_address) {
        const addressLines = doc.splitTextToSize(order.customer_address, (contentWidth / 2) - 15);
        doc.text(addressLines, col2X, addressY);
        addressY += (addressLines.length * 4);
    }

    const tableStartY = Math.max(yDetails + 30, addressY + 10);


    // --- Items Table ---
    const tableRawData = order.items.map(item => [
        item.product?.name || 'Item Unavailable',
        item.quantity.toString(),
        `Rs. ${item.price_at_purchase.toLocaleString()}`,
        `Rs. ${(item.price_at_purchase * item.quantity).toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: tableStartY,
        margin: { left: margin, right: margin }, // Align with outer container margin
        head: [['Item', 'Quantity', 'Price', 'Total']],
        body: tableRawData,
        theme: 'plain',
        headStyles: {
            fillColor: colors.tableHeader,
            textColor: '#FFFFFF',
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left',
            valign: 'middle',
            cellPadding: 8
        },
        styles: {
            fontSize: 9,
            cellPadding: 8,
            textColor: colors.textPrimary,
            valign: 'middle', // Align text vertically center
            lineWidth: 0,
        },
        columnStyles: {
            0: { cellWidth: 'auto', halign: 'left' },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
        },
        didParseCell: (data) => {
            // Apply header specific alignment safely
            if (data.section === 'head') {
                if (data.column.index === 1) data.cell.styles.halign = 'center';
                if (data.column.index === 2) data.cell.styles.halign = 'right';
                if (data.column.index === 3) data.cell.styles.halign = 'right';
            }
        },
        didDrawCell: (data) => {
            if (data.section === 'body') {
                doc.setDrawColor(colors.border);
                doc.setLineWidth(0.1);
                doc.line(
                    data.cell.x,
                    data.cell.y + data.cell.height,
                    data.cell.x + data.cell.width,
                    data.cell.y + data.cell.height
                );
            }
        }
    });

    // --- Footer / Totals ---
    // Calculate precise layout for the card
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryBoxWidth = 90;
    const summaryBoxX = pageWidth - margin - summaryBoxWidth;
    const boxPadding = 6;
    const summaryBoxHeight = 44; // Fixed height for consistency

    // Background for summary
    roundedBox(summaryBoxX, finalY, summaryBoxWidth, summaryBoxHeight, '#FAFAFA');

    const labelX_Summary = summaryBoxX + boxPadding + 4; // Slight indentation
    const valueX_Summary = pageWidth - margin - boxPadding - 4;

    const startTextY = finalY + 12; // Start text a bit lower inside the box
    const lineHeight = 7;

    doc.setFontSize(9);
    doc.setTextColor(colors.textSecondary);

    // Subtotal
    doc.text('Subtotal:', labelX_Summary, startTextY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textPrimary);
    doc.text(`Rs. ${order.total_amount.toLocaleString()}`, valueX_Summary, startTextY, { align: 'right' });

    // Shipping
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSecondary);
    doc.text('Shipping:', labelX_Summary, startTextY + lineHeight);
    doc.setTextColor(colors.textPrimary);
    doc.text('Free', valueX_Summary, startTextY + lineHeight, { align: 'right' });

    // Divider
    doc.setDrawColor(colors.border);
    doc.line(summaryBoxX + boxPadding, startTextY + lineHeight + 6, pageWidth - margin - boxPadding, startTextY + lineHeight + 6);

    // Total
    const totalY = startTextY + lineHeight + 18; // Give enough space after line
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textPrimary);
    doc.text('Total:', labelX_Summary, totalY);

    doc.setTextColor(colors.accent);
    doc.text(`Rs. ${order.total_amount.toLocaleString()}`, valueX_Summary, totalY, { align: 'right' });

    // Footer Message
    const footerY = pageHeight - margin - 10;
    doc.setFontSize(8);
    doc.setTextColor(colors.textSecondary);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping with The Bottle Stories.', pageWidth / 2, footerY, { align: 'center' });

    // Save
    doc.save(`invoice_${order._id}.pdf`);
};
