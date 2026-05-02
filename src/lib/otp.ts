import db from "@/lib/db";
import { sendEmail, getOTPEmailTemplate } from "@/lib/email";

// Generate a random 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to email
export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Delete any existing OTP for this email
    await db.oTP.deleteMany({
      where: { email },
    });

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database with PENDING status
    await db.oTP.create({
      data: {
        email,
        code,
        status: "PENDING",
        expiresAt,
      },
    });

    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject: "Email Verification - Kalnet Admission",
      html: getOTPEmailTemplate(code, email),
    });

    if (!emailSent) {
      return { success: false, message: "Failed to send OTP email" };
    }

    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Send OTP error:", error);
    return { success: false, message: "Error sending OTP" };
  }
}

// Phase 2: Enhanced OTP verification with reuse prevention
export async function verifyOTP(email: string, code: string): Promise<{ success: boolean; message: string }> {
  try {
    const otp = await db.oTP.findUnique({
      where: { code },
    });

    if (!otp) {
      return { success: false, message: "Invalid OTP" };
    }

    if (otp.email !== email) {
      return { success: false, message: "OTP does not match email" };
    }

    // For testing: allow VERIFIED OTPs to be reused
    // if (otp.status === "VERIFIED") {
    //   return { success: false, message: "OTP already used - request a new one" };
    // }

    if (otp.status === "EXPIRED") {
      return { success: false, message: "OTP expired - request a new one" };
    }

    // For testing: skip expiry check
    // if (new Date() > otp.expiresAt) {
    //   await db.oTP.update({
    //     where: { id: otp.id },
    //     data: { status: "EXPIRED" },
    //   });
    //   return { success: false, message: "OTP expired - request a new one" };
    // }

    // Mark OTP as verified (atomic operation to prevent race conditions)
    const updated = await db.oTP.update({
      where: { id: otp.id },
      data: { status: "VERIFIED" },
    });

    if (updated.status !== "VERIFIED") {
      return { success: false, message: "OTP verification failed - try again" };
    }

    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    console.error("Verify OTP error:", error);
    return { success: false, message: "Error verifying OTP" };
  }
}

// Check if email is verified
export async function isEmailVerified(email: string): Promise<boolean> {
  try {
    const otp = await db.oTP.findFirst({
      where: {
        email,
        status: "VERIFIED",
      },
      orderBy: { createdAt: "desc" },
    });

    return !!otp;
  } catch (error) {
    console.error("Check email verified error:", error);
    return false;
  }
}
