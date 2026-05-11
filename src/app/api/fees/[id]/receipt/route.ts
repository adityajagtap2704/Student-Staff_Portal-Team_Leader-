import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { getReceiptByFeeId } from "@/lib/paymentDb";

function generateReceiptHTML(data: {
  receiptNumber: string;
  issuedAt: string;
  studentName: string;
  rollNumber: string;
  classEnrolled: string;
  email: string;
  term: string;
  feeType: string;
  dueDate: string;
  amountInr: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  feeId: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Fee Receipt</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          padding: 50px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #1e293b;
          padding-bottom: 25px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1e293b;
          font-size: 32px;
          margin-bottom: 5px;
        }
        .header p {
          color: #64748b;
          font-size: 13px;
          margin: 3px 0;
        }
        .receipt-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 6px;
        }
        .meta-item {
          font-size: 14px;
        }
        .meta-label {
          color: #64748b;
          font-weight: 600;
        }
        .meta-value {
          color: #1e293b;
          margin-top: 3px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          border-bottom: 1px solid #f1f5f9;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #475569;
          font-weight: 500;
        }
        .detail-value {
          color: #1e293b;
          text-align: right;
        }
        .amount-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #0284c7;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          margin: 35px 0;
        }
        .amount-label {
          font-size: 12px;
          color: #0c4a6e;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .amount-value {
          font-size: 42px;
          font-weight: 700;
          color: #0284c7;
          margin-top: 12px;
        }
        .status-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          border-top: 2px solid #e2e8f0;
          padding-top: 25px;
          margin-top: 35px;
          font-size: 12px;
          color: #64748b;
        }
        .footer p {
          margin: 5px 0;
        }
        @media print {
          body { background: white; }
          .container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>KALNET SCHOOL</h1>
          <p>Fee Receipt (System Generated)</p>
          <p>KALNET Campus, Main Road, Telangana, India</p>
        </div>

        <div class="receipt-meta">
          <div class="meta-item">
            <div class="meta-label">Receipt No</div>
            <div class="meta-value">${data.receiptNumber}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Receipt Date</div>
            <div class="meta-value">${data.issuedAt}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Student Details</div>
          <div class="detail-row">
            <span class="detail-label">Name</span>
            <span class="detail-value">${data.studentName || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Roll Number</span>
            <span class="detail-value">${data.rollNumber || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Class</span>
            <span class="detail-value">${data.classEnrolled || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">${data.email || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Fee Details</div>
          <div class="detail-row">
            <span class="detail-label">Term</span>
            <span class="detail-value">${data.term}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fee Type</span>
            <span class="detail-value">${data.feeType}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Due Date</span>
            <span class="detail-value">${data.dueDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="status-badge">PAID</span></span>
          </div>
        </div>

        <div class="amount-section">
          <div class="amount-label">Amount Paid</div>
          <div class="amount-value">₹${data.amountInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        <div class="section">
          <div class="section-title">Payment Reference</div>
          ${data.razorpayOrderId ? `
            <div class="detail-row">
              <span class="detail-label">Razorpay Order ID</span>
              <span class="detail-value">${data.razorpayOrderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Razorpay Payment ID</span>
              <span class="detail-value">${data.razorpayPaymentId || 'N/A'}</span>
            </div>
          ` : `
            <div class="detail-row">
              <span class="detail-label">Fee ID</span>
              <span class="detail-value">${data.feeId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status</span>
              <span class="detail-value">PAID</span>
            </div>
          `}
        </div>

        <div class="footer">
          <p>This is a computer-generated receipt. No signature is required.</p>
          <p>For payment queries, contact fees@kalnet.edu</p>
          <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>
      <script>
        window.addEventListener('load', function() {
          window.print();
        });
      </script>
    </body>
    </html>
  `;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || !user?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const feeId = Number(id);
    if (!feeId || Number.isNaN(feeId)) {
      return NextResponse.json({ error: "Invalid fee id" }, { status: 400 });
    }

    const fee = await db.fee.findUnique({
      where: { id: feeId },
      include: {
        student: { select: { id: true, name: true, email: true, classEnrolled: true, rollNumber: true } },
      },
    });
    if (!fee) return NextResponse.json({ error: "Fee not found" }, { status: 404 });

    if (user.role === "STUDENT" && Number(user.id) !== fee.studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (user.role === "CLASS_TEACHER" && fee.student?.classEnrolled !== user.assignedClass) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (user.role !== "STUDENT" && user.role !== "CLASS_TEACHER" && user.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const receipt = await getReceiptByFeeId(feeId);
    
    // If no receipt found but fee is paid, generate one anyway
    if (!receipt && fee.status !== "PAID") {
      return NextResponse.json({ error: "Receipt not available (fee not paid)" }, { status: 409 });
    }

    const amountInr = receipt ? (receipt.amountPaise ?? 0) / 100 : Number(fee.paidAmount);
    const issuedAt = receipt?.issuedAt ? new Date(receipt.issuedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

    const html = generateReceiptHTML({
      receiptNumber: receipt?.receiptNumber ?? `RCP-${feeId}`,
      issuedAt,
      studentName: fee.student?.name || '',
      rollNumber: fee.student?.rollNumber || '',
      classEnrolled: fee.student?.classEnrolled || '',
      email: fee.student?.email || '',
      term: fee.term,
      feeType: fee.type,
      dueDate: new Date(fee.dueDate).toLocaleDateString('en-IN'),
      amountInr,
      razorpayOrderId: receipt?.razorpayOrderId || undefined,
      razorpayPaymentId: receipt?.razorpayPaymentId || undefined,
      feeId,
    });

    // Return HTML that can be printed/saved as PDF by the browser
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="receipt-${feeId}.html"`,
      },
    });
  } catch (error) {
    console.error("Receipt Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
