import db from "@/lib/db";
import { Prisma } from "@prisma/client";

export type PaymentRow = {
  id: number;
  feeId: number;
  studentId: number;
  amountPaise: number;
  currency: string;
  razorpayOrderId: string;
  status: "CREATED" | "PAID" | "FAILED";
  receipt: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function recordSuccessfulPayment(input: {
  feeId: number;
  studentId: number;
  amountPaise: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  receipt?: string | null;
  rawResponse?: any;
}): Promise<void> {
  const {
    feeId,
    studentId,
    amountPaise,
    currency,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    receipt,
    rawResponse,
  } = input;

  // 1) Upsert order row as PAID (idempotent)
  await db.$executeRaw(
    Prisma.sql`
      INSERT INTO payment_orders
        (fee_id, student_id, amount_paise, currency, razorpay_order_id, status, receipt, created_at, updated_at)
      VALUES
        (${feeId}, ${studentId}, ${amountPaise}, ${currency}, ${razorpayOrderId}, 'PAID', ${receipt ?? null}, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        fee_id = VALUES(fee_id),
        student_id = VALUES(student_id),
        amount_paise = VALUES(amount_paise),
        currency = VALUES(currency),
        status = 'PAID',
        receipt = COALESCE(VALUES(receipt), receipt),
        updated_at = NOW()
    `
  );

  // 2) Insert transaction (idempotent)
  await db.$executeRaw(
    Prisma.sql`
      INSERT IGNORE INTO payment_transactions
        (razorpay_order_id, razorpay_payment_id, razorpay_signature, raw_response, created_at)
      VALUES
        (${razorpayOrderId}, ${razorpayPaymentId}, ${razorpaySignature}, ${rawResponse ? JSON.stringify(rawResponse) : null}, NOW())
    `
  );

  // 3) Create receipt (idempotent)
  await db.$executeRaw(
    Prisma.sql`
      INSERT IGNORE INTO fee_receipts
        (razorpay_order_id, issued_at, created_at)
      VALUES
        (${razorpayOrderId}, NOW(), NOW())
    `
  );
}

export async function getReceiptByFeeId(feeId: number) {
  const rows = (await db.$queryRaw(
    Prisma.sql`
      SELECT
        po.razorpay_order_id   AS razorpayOrderId,
        po.amount_paise        AS amountPaise,
        po.currency            AS currency,
        po.status              AS status,
        fr.receipt_number      AS receiptNumber,
        fr.issued_at           AS issuedAt,
        pt.razorpay_payment_id AS razorpayPaymentId
      FROM payment_orders po
      LEFT JOIN fee_receipts fr
        ON fr.razorpay_order_id = po.razorpay_order_id
      LEFT JOIN payment_transactions pt
        ON pt.razorpay_order_id = po.razorpay_order_id
      WHERE po.fee_id = ${feeId}
        AND po.status = 'PAID'
      ORDER BY po.updated_at DESC
      LIMIT 1
    `
  )) as Array<{
    razorpayOrderId: string;
    amountPaise: number;
    currency: string;
    status: string;
    receiptNumber: string | null;
    issuedAt: Date | null;
    razorpayPaymentId: string | null;
  }>;

  return rows[0] ?? null;
}

export async function listPaymentsForRole(input: {
  role: "STUDENT" | "CLASS_TEACHER" | "HOD";
  studentId?: number;
  assignedClass?: string;
  limit?: number;
}) {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);

  if (input.role === "STUDENT") {
    return (await db.$queryRaw(
      Prisma.sql`
        SELECT
          po.fee_id              AS feeId,
          po.student_id          AS studentId,
          s.name                 AS studentName,
          s.classEnrolled        AS classEnrolled,
          f.term                 AS term,
          po.amount_paise        AS amountPaise,
          po.currency            AS currency,
          po.status              AS status,
          po.razorpay_order_id   AS razorpayOrderId,
          pt.razorpay_payment_id AS razorpayPaymentId,
          fr.receipt_number      AS receiptNumber,
          po.updated_at          AS updatedAt
        FROM payment_orders po
        JOIN students s ON s.id = po.student_id
        JOIN fees f     ON f.id = po.fee_id
        LEFT JOIN payment_transactions pt ON pt.razorpay_order_id = po.razorpay_order_id
        LEFT JOIN fee_receipts fr        ON fr.razorpay_order_id = po.razorpay_order_id
        WHERE po.student_id = ${input.studentId ?? 0}
        ORDER BY po.updated_at DESC
        LIMIT ${limit}
      `
    )) as any[];
  }

  if (input.role === "CLASS_TEACHER") {
    return (await db.$queryRaw(
      Prisma.sql`
        SELECT
          po.fee_id              AS feeId,
          po.student_id          AS studentId,
          s.name                 AS studentName,
          s.classEnrolled        AS classEnrolled,
          f.term                 AS term,
          po.amount_paise        AS amountPaise,
          po.currency            AS currency,
          po.status              AS status,
          po.razorpay_order_id   AS razorpayOrderId,
          pt.razorpay_payment_id AS razorpayPaymentId,
          fr.receipt_number      AS receiptNumber,
          po.updated_at          AS updatedAt
        FROM payment_orders po
        JOIN students s ON s.id = po.student_id
        JOIN fees f     ON f.id = po.fee_id
        LEFT JOIN payment_transactions pt ON pt.razorpay_order_id = po.razorpay_order_id
        LEFT JOIN fee_receipts fr        ON fr.razorpay_order_id = po.razorpay_order_id
        WHERE s.classEnrolled = ${input.assignedClass ?? ""}
        ORDER BY po.updated_at DESC
        LIMIT ${limit}
      `
    )) as any[];
  }

  return (await db.$queryRaw(
    Prisma.sql`
      SELECT
        po.fee_id              AS feeId,
        po.student_id          AS studentId,
        s.name                 AS studentName,
        s.classEnrolled        AS classEnrolled,
        f.term                 AS term,
        po.amount_paise        AS amountPaise,
        po.currency            AS currency,
        po.status              AS status,
        po.razorpay_order_id   AS razorpayOrderId,
        pt.razorpay_payment_id AS razorpayPaymentId,
        fr.receipt_number      AS receiptNumber,
        po.updated_at          AS updatedAt
      FROM payment_orders po
      JOIN students s ON s.id = po.student_id
      JOIN fees f     ON f.id = po.fee_id
      LEFT JOIN payment_transactions pt ON pt.razorpay_order_id = po.razorpay_order_id
      LEFT JOIN fee_receipts fr        ON fr.razorpay_order_id = po.razorpay_order_id
      ORDER BY po.updated_at DESC
      LIMIT ${limit}
    `
  )) as any[];
}

