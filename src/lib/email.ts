import nodemailer from "nodemailer";

// Configure your email service here
// For development, use Ethereal Email (fake SMTP)
// For production, use SendGrid, Gmail, or other services

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@kalnet.edu",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

// OTP Email Template
export function getOTPEmailTemplate(otp: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .otp-box { background: white; border: 2px solid #667eea; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { font-size: 12px; color: #999; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for submitting your admission enquiry. To verify your email address, please use the following OTP:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <div class="footer">
              <p>© 2024 Kalnet School Management System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Admission Approval Email Template
export function getAdmissionApprovalTemplate(
  studentName: string,
  referenceNumber: string,
  email: string,
  password: string,
  rollNumber: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .credentials-box { background: white; border: 2px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .credential-item { margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 4px; }
          .label { font-weight: bold; color: #667eea; }
          .footer { font-size: 12px; color: #999; margin-top: 20px; text-align: center; }
          .success-badge { display: inline-block; background: #28a745; color: white; padding: 8px 16px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Admission Approved!</h1>
          </div>
          <div class="content">
            <p>Dear Parent/Guardian,</p>
            <p>We are delighted to inform you that <strong>${studentName}</strong>'s admission enquiry has been <span class="success-badge">APPROVED</span>.</p>
            
            <p><strong>Enquiry Reference Number:</strong> ${referenceNumber}</p>
            
            <p>Your student account has been created. Please use the following credentials to log in to the student portal:</p>
            
            <div class="credentials-box">
              <div class="credential-item">
                <span class="label">Email:</span> ${email}
              </div>
              <div class="credential-item">
                <span class="label">Password:</span> ${password}
              </div>
              <div class="credential-item">
                <span class="label">Roll Number:</span> ${rollNumber}
              </div>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Log in to the student portal using the credentials above</li>
              <li>Complete your profile information</li>
              <li>Upload required documents</li>
              <li>Pay the application fees</li>
            </ul>
            
            <p>If you have any questions, please contact our admissions office.</p>
            
            <div class="footer">
              <p>© 2024 Kalnet School Management System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Admission Rejection Email Template
export function getAdmissionRejectionTemplate(
  studentName: string,
  referenceNumber: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { font-size: 12px; color: #999; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Admission Enquiry Status Update</h1>
          </div>
          <div class="content">
            <p>Dear Parent/Guardian,</p>
            <p>Thank you for your interest in our school. We regret to inform you that the admission enquiry for <strong>${studentName}</strong> (Reference: ${referenceNumber}) has not been approved at this time.</p>
            
            <p>We appreciate your interest and encourage you to apply again in the future. If you have any questions, please feel free to contact our admissions office.</p>
            
            <div class="footer">
              <p>© 2024 Kalnet School Management System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
