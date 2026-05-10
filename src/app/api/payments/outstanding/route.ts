import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { getRazorpay } from "@/lib/razorpay";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * POST /api/payments/outstanding
 * Creates a payment order for outstanding/miscellaneous fees
 * This endpoint handles payments that are not tied to a specific term fee
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const amount = Number(body?.amount);
    const reason = String(body?.reason || "Outstanding Payment");

    if (!amount || amount <= 0 || Number.isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const studentId = Number(user.id);

    // Create an outstanding fee record
    const outstandingFee = await db.fee.create({
      data: {
        studentId,
        term: `Outstanding - ${new Date().toLocaleDateString()}`,
        dueDate: new Date(), // Due immediately
        amount: new Decimal(amount),
        paidAmount: new Decimal(0),
        type: "Outstanding",
        status: "PENDING",
      },
    });

    const amountPaise = Math.round(amount * 100);
    const receipt = `outstanding_${outstandingFee.id}_${Date.now()}`;

    const razorpay = getRazorpay();
    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    if (!razorpay || !publicKey) {
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 503 }
      );
    }

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        feeId: String(outstandingFee.id),
        studentId: String(studentId),
        type: "Outstanding",
        reason,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: publicKey,
      name: "KALNET",
      description: `Outstanding Payment - ${reason}`,
      prefill: {
        name: user.name ?? "",
        email: user.email ?? "",
      },
      notes: {
        feeId: outstandingFee.id,
      },
    });
  } catch (error) {
    console.error("Outstanding Payment Order Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
