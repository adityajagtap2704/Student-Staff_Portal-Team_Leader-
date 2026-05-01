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

    // Store OTP in database
    await db.oTP.create({
      data: {
        email,
        code,
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

// Verify OTP
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

    if (otp.status !== "PENDING") {
      return { success: false, message: "OTP already used" };
    }

    if (new Date() > otp.expiresAt) {
      return { success: false, message: "OTP expired" };
    }

    // Mark OTP as verified
    await db.oTP.update({
      where: { id: otp.id },
      data: { status: "VERIFIED" },
    });

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
