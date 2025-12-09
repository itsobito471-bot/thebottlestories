
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from './types';
import { format } from 'date-fns';

export const generateInvoicePDF = (order: Order) => {
    const doc = new jsPDF();

    // Colors
    const primaryColor = '#1C1C1C';
    const secondaryColor = '#666666';
    const accentColor = '#D4AF37'; // Gold

    // --- Header ---

    // Logo / Brand Name
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('THE BOTTLE STORIES', 20, 20);

    // Company Details
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Inspired Perfumes', 20, 26);
    doc.text('www.thebottlestories.com', 20, 31);
    // doc.text('support@thebottlestories.com', 20, 36); // Add if you have it

    // INVOICE text
    doc.setFontSize(30);
    doc.setTextColor(accentColor); // Gold Invoice
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 190, 25, { align: 'right' }); // Align right for better balance

    // Divider
    doc.setDrawColor(212, 175, 55); // Gold line
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    // --- Invoice Info & Customer Info ---

    const yStart = 55;

    // Invoice Details
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.text('Invoice Number:', 20, yStart);
    doc.text('Date:', 20, yStart + 6);
    doc.text('Status:', 20, yStart + 12);

    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${order._id.slice(-6).toUpperCase()}`, 60, yStart);
    doc.text(format(new Date(order.createdAt || order.created_at || new Date()), 'MMM dd, yyyy'), 60, yStart + 6);
    doc.text(order.status.toUpperCase(), 60, yStart + 12);

    // Bill To area
    // Move 'Bill To' slightly left if needed or keep at 120
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Bill To:', 120, yStart);

    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(order.customer_name, 120, yStart + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor);
    if (order.customer_email) {
        doc.text(order.customer_email, 120, yStart + 12);
    }

    // Address
    let addressY = yStart + 18;
    if (order.shipping_address) {
        const addr = order.shipping_address;
        // Ensure we handle missing fields gracefully
        const addressText = [addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(', ');
        const addressLines = doc.splitTextToSize(addressText, 70);
        doc.text(addressLines, 120, addressY);
    } else if (order.customer_address) {
        const addressLines = doc.splitTextToSize(order.customer_address, 70);
        doc.text(addressLines, 120, addressY);
    }


    // --- Order Items Table ---
    // Ensure addressY accounts for multi-line address
    // We can just add a safe buffer or calculate it more precisely but +25 is usually safe

    const tableRawData = order.items.map(item => [
        item.product?.name || 'Item Unavailable',
        item.quantity.toString(),
        `Rs. ${item.price_at_purchase.toLocaleString()}`,
        `Rs. ${(item.price_at_purchase * item.quantity).toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: addressY + 25,
        head: [['Item', 'Quantity', 'Price', 'Total']],
        body: tableRawData,
        theme: 'plain', // Clean modern look
        headStyles: {
            fillColor: '#1C1C1C',
            textColor: '#FFFFFF',
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'left',
            cellPadding: 10 // More breathing room
        },
        styles: {
            fontSize: 10,
            cellPadding: 10,
            textColor: '#222222',
            lineColor: '#EEEEEE',
            lineWidth: 0.1,
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 40, halign: 'right' }
        },
        didDrawCell: (data: any) => {
            // Add bottom border to every row for a clean look
            // Draw only once per row (e.g., first column)
            if (data.section === 'body' && data.column.index === 0) {
                const doc = data.doc;
                const pageSize = doc.internal.pageSize;
                const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

                // Use settings.margin.left if available, else default to 14
                const marginLeft = data.settings.margin.left || 14;
                // Alternatively, use cell.x for start
                const startX = data.cell.x;

                // Calculate endX. Table width might not be directly available in all versions.
                // We can use pageWidth - margin.right
                const marginRight = data.settings.margin.right || 14;
                const endX = pageWidth - marginRight;

                doc.setDrawColor(238, 238, 238);
                doc.line(
                    marginLeft,
                    data.cell.y + data.cell.height,
                    endX,
                    data.cell.y + data.cell.height
                );
            }
        }
    });

    // --- Footer / Totals ---

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Totals Area
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.text('Subtotal:', 140, finalY);
    doc.text('Shipping:', 140, finalY + 7);

    doc.setFontSize(14); // Larger total
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 140, finalY + 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryColor);
    doc.text(`Rs. ${order.total_amount.toLocaleString()}`, 190, finalY, { align: 'right' });
    doc.text('Free', 190, finalY + 7, { align: 'right' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentColor); // Gold Total
    doc.text(`Rs. ${order.total_amount.toLocaleString()}`, 190, finalY + 18, { align: 'right' });

    // Decorate bottom
    const pageHeight = doc.internal.pageSize.height;

    // Thank you message
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for choosing The Bottle Stories.', 105, finalY + 30, { align: 'center' });

    // Save
    doc.save(`invoice_${order._id}.pdf`);
};
