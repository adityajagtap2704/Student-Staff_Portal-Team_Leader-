import { sendEmail } from "@/lib/email";

/**
 * Phase 3: Email Notifications
 * Sends email notifications for important events
 */

/**
 * Send admission approved email
 */
export async function sendAdmissionApprovedEmail(
  studentName: string,
  email: string,
  referenceNumber: string,
  classApplied: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Admission Approved!</h2>
        <p>Dear ${studentName},</p>
        <p>Congratulations! Your admission application has been approved.</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Reference Number:</strong> ${referenceNumber}</p>
          <p><strong>Class Applied:</strong> ${classApplied}</p>
        </div>
        <p>Please contact the school office for further instructions and document submission.</p>
        <p>Best regards,<br/>KALNET School Management System</p>
      </div>
    `;

    return await sendEmail({
      to: email,
      subject: "Admission Approved - KALNET School",
      html,
    });
  } catch (error) {
    console.error("[EMAIL] Error sending admission approved email:", error);
    return false;
  }
}

/**
 * Send admission rejected email
 */
export async function sendAdmissionRejectedEmail(
  studentName: string,
  email: string,
  referenceNumber: string,
  rejectionReason?: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Admission Status Update</h2>
        <p>Dear ${studentName},</p>
        <p>Thank you for your interest in KALNET School. We regret to inform you that your admission application has not been approved at this time.</p>
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Reference Number:</strong> ${referenceNumber}</p>
          ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ""}
        </div>
        <p>Please feel free to contact the school office if you have any questions.</p>
        <p>Best regards,<br/>KALNET School Management System</p>
      </div>
    `;

    return await sendEmail({
      to: email,
      subject: "Admission Status Update - KALNET School",
      html,
    });
  } catch (error) {
    console.error("[EMAIL] Error sending admission rejected email:", error);
    return false;
  }
}

/**
 * Send leave approved email
 */
export async function sendLeaveApprovedEmail(
  studentName: string,
  email: string,
  fromDate: Date,
  toDate: Date,
  leaveType: string
): Promise<boolean> {
  try {
    const fromStr = fromDate.toLocaleDateString("en-IN");
    const toStr = toDate.toLocaleDateString("en-IN");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Leave Request Approved</h2>
        <p>Dear ${studentName},</p>
        <p>Your leave request has been approved.</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>From:</strong> ${fromStr}</p>
          <p><strong>To:</strong> ${toStr}</p>
        </div>
        <p>Please ensure you complete any pending assignments before your leave.</p>
        <p>Best regards,<br/>KALNET School Management System</p>
      </div>
    `;

    return await sendEmail({
      to: email,
      subject: "Leave Request Approved - KALNET School",
      html,
    });
  } catch (error) {
    console.error("[EMAIL] Error sending leave approved email:", error);
    return false;
  }
}

/**
 * Send leave rejected email
 */
export async function sendLeaveRejectedEmail(
  studentName: string,
  email: string,
  fromDate: Date,
  toDate: Date,
  leaveType: string,
  rejectionReason?: string
): Promise<boolean> {
  try {
    const fromStr = fromDate.toLocaleDateString("en-IN");
    const toStr = toDate.toLocaleDateString("en-IN");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Leave Request Status Update</h2>
        <p>Dear ${studentName},</p>
        <p>Your leave request has been reviewed and unfortunately cannot be approved at this time.</p>
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>From:</strong> ${fromStr}</p>
          <p><strong>To:</strong> ${toStr}</p>
          ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ""}
        </div>
        <p>Please contact your class teacher if you have any questions.</p>
        <p>Best regards,<br/>KALNET School Management System</p>
      </div>
    `;

    return await sendEmail({
      to: email,
      subject: "Leave Request Status Update - KALNET School",
      html,
    });
  } catch (error) {
    console.error("[EMAIL] Error sending leave rejected email:", error);
    return false;
  }
}

/**
 * Send fee overdue notification
 */
export async function sendFeeOverdueEmail(
  studentName: string,
  email: string,
  amount: number,
  dueDate: Date,
  term: string
): Promise<boolean> {
  try {
    const dueDateStr = dueDate.toLocaleDateString("en-IN");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Fee Payment Overdue</h2>
        <p>Dear ${studentName},</p>
        <p>This is a reminder that your fee payment is overdue.</p>
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Term:</strong> ${term}</p>
          <p><strong>Amount Due:</strong> ₹${amount.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${dueDateStr}</p>
        </div>
        <p>Please make the payment at your earliest convenience to avoid any inconvenience.</p>
        <p>Best regards,<br/>KALNET School Management System</p>
      </div>
    `;

    return await sendEmail({
      to: email,
      subject: "Fee Payment Overdue - KALNET School",
      html,
    });
  } catch (error) {
    console.error("[EMAIL] Error sending fee overdue email:", error);
    return false;
  }
}

/**
 * Send fee payment confirmation email
 */
export async function sendFeePaymentConfirmationEmail(
  studentName: string,
  email: string,
  amount: number,
  term: string,
  transactionId: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Fee Payment Confirmation</h2>
        <p>Dear ${studentName},</p>
        <p>Thank you for your fee payment. Your payment has been successfully processed.</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Term:</strong> ${term}</p>
          <p><strong>Amount Paid:</strong> ₹${amount.toFixed(2)}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
        </div>
        <p>Please keep this email for your records.</p>
        <p>Best regards,<br/>KALNET School Management System</p>
      </div>
    `;

    return await sendEmail({
      to: email,
      subject: "Fee Payment Confirmation - KALNET School",
      html,
    });
  } catch (error) {
    console.error("[EMAIL] Error sending fee payment confirmation email:", error);
    return false;
  }
}
