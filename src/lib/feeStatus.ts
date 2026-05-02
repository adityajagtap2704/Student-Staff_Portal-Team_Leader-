import db from "@/lib/db";

/**
 * Phase 2: Automatic OVERDUE fee status update
 * Updates fees to OVERDUE if:
 * 1. Status is PENDING
 * 2. Due date has passed
 * 3. Amount is not fully paid
 */
export async function updateOverdueFees(): Promise<number> {
  try {
    const now = new Date();
    
    // Find all PENDING fees with past due dates
    const overdueFees = await db.fee.findMany({
      where: {
        status: "PENDING",
        dueDate: { lt: now },
        paidAmount: { lt: db.fee.fields.amount }, // paidAmount < amount
      },
    });

    if (overdueFees.length === 0) {
      return 0;
    }

    // Update all overdue fees to OVERDUE status
    const result = await db.fee.updateMany({
      where: {
        status: "PENDING",
        dueDate: { lt: now },
        paidAmount: { lt: db.fee.fields.amount },
      },
      data: {
        status: "OVERDUE",
      },
    });

    console.log(`[FEE STATUS] Updated ${result.count} fees to OVERDUE status`);
    return result.count;
  } catch (error) {
    console.error("[FEE STATUS] Error updating overdue fees:", error);
    return 0;
  }
}

/**
 * Get fee status with automatic OVERDUE update
 * Call this before returning fees to ensure status is current
 */
export async function getFeeWithUpdatedStatus(feeId: number) {
  try {
    const fee = await db.fee.findUnique({ where: { id: feeId } });
    if (!fee) return null;

    // Check if should be OVERDUE
    const now = new Date();
    if (
      fee.status === "PENDING" &&
      fee.dueDate < now &&
      Number(fee.paidAmount) < Number(fee.amount)
    ) {
      // Update to OVERDUE
      return await db.fee.update({
        where: { id: feeId },
        data: { status: "OVERDUE" },
      });
    }

    return fee;
  } catch (error) {
    console.error("[FEE STATUS] Error getting fee with updated status:", error);
    return null;
  }
}
