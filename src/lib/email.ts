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
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - KALNET</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; background-color: #f3f4f6; line-height: 1.6; }
          .wrapper { background-color: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
          .description { font-size: 14px; color: #4b5563; margin-bottom: 32px; line-height: 1.8; }
          .otp-container { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; border-radius: 8px; padding: 30px; text-align: center; margin: 32px 0; }
          .otp-label { font-size: 12px; font-weight: 600; color: #0369a1; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .otp-code { font-size: 42px; font-weight: 700; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .expiry-notice { font-size: 12px; color: #6b7280; background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 24px 0; }
          .security-note { font-size: 13px; color: #4b5563; margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #6b7280; }
          .security-note strong { color: #1f2937; }
          .footer { background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer-text { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
          .footer-links { font-size: 12px; }
          .footer-links a { color: #3b82f6; text-decoration: none; margin: 0 8px; }
          .footer-links a:hover { text-decoration: underline; }
          .divider { height: 1px; background-color: #e5e7eb; margin: 24px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>🔐 Email Verification</h1>
              <p>KALNET School Management System</p>
            </div>
            <div class="content">
              <p class="greeting">Hello,</p>
              <p class="description">Thank you for submitting your admission enquiry to KALNET School. To verify your email address and proceed with your application, please use the verification code below:</p>
              
              <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="expiry-notice">
                ⏱️ This code will expire in <strong>10 minutes</strong>. Please enter it promptly.
              </div>
              
              <div class="security-note">
                <strong>🔒 Security Tip:</strong> Never share this code with anyone. KALNET staff will never ask for your verification code via email or phone.
              </div>
              
              <p style="font-size: 14px; color: #4b5563; margin-top: 24px;">If you didn't request this verification code, please ignore this email or contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p class="footer-text">© 2024 KALNET School Management System. All rights reserved.</p>
              <div class="footer-links">
                <a href="#">Help Center</a> | <a href="#">Contact Support</a> | <a href="#">Privacy Policy</a>
              </div>
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
  setupLink: string,
  rollNumber: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admission Approved - KALNET</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; background-color: #f3f4f6; line-height: 1.6; }
          .wrapper { background-color: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
          .success-message { font-size: 15px; color: #4b5563; margin-bottom: 24px; line-height: 1.8; }
          .success-badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; margin: 8px 0; }
          .reference-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 24px 0; }
          .reference-item { margin: 12px 0; }
          .reference-label { font-size: 12px; font-weight: 600; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; }
          .reference-value { font-size: 16px; font-weight: 700; color: #065f46; margin-top: 4px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 24px 0; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); transition: transform 0.2s; }
          .cta-button:hover { transform: translateY(-2px); }
          .cta-container { text-align: center; }
          .link-expiry { font-size: 12px; color: #6b7280; text-align: center; margin-top: 12px; }
          .next-steps { margin: 32px 0; }
          .next-steps h3 { font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
          .next-steps ol { margin-left: 20px; }
          .next-steps li { font-size: 14px; color: #4b5563; margin-bottom: 10px; line-height: 1.6; }
          .credentials-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0; }
          .credential-item { margin: 12px 0; padding: 12px; background-color: #ffffff; border-radius: 6px; border-left: 4px solid #10b981; }
          .credential-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
          .credential-value { font-size: 15px; font-weight: 600; color: #1f2937; margin-top: 4px; }
          .support-section { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin: 24px 0; }
          .support-section p { font-size: 14px; color: #4b5563; }
          .footer { background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer-text { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
          .footer-links { font-size: 12px; }
          .footer-links a { color: #10b981; text-decoration: none; margin: 0 8px; }
          .footer-links a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>🎉 Admission Approved!</h1>
              <p>Welcome to KALNET School</p>
            </div>
            <div class="content">
              <p class="greeting">Dear Parent/Guardian,</p>
              <p class="success-message">We are delighted to inform you that <strong>${studentName}</strong>'s admission enquiry has been <span class="success-badge">APPROVED</span>. Congratulations!</p>
              
              <div class="reference-box">
                <div class="reference-item">
                  <div class="reference-label">📋 Enquiry Reference Number</div>
                  <div class="reference-value">${referenceNumber}</div>
                </div>
              </div>
              
              <p style="font-size: 15px; color: #4b5563; margin: 24px 0;">Your student account has been created and is ready to use. Please click the button below to set up your password and complete the account setup process:</p>
              
              <div class="cta-container">
                <a href="${setupLink}" class="cta-button">Complete Account Setup</a>
                <p class="link-expiry">⏱️ This link will expire in 24 hours</p>
              </div>
              
              <div class="credentials-box">
                <div class="credential-item">
                  <div class="credential-label">📧 Email Address</div>
                  <div class="credential-value">${email}</div>
                </div>
                <div class="credential-item">
                  <div class="credential-label">🎓 Roll Number</div>
                  <div class="credential-value">${rollNumber}</div>
                </div>
              </div>
              
              <div class="next-steps">
                <h3>📝 Next Steps:</h3>
                <ol>
                  <li>Click the "Complete Account Setup" button above</li>
                  <li>Create a secure password for your account</li>
                  <li>Log in to the student portal</li>
                  <li>Complete your profile information</li>
                  <li>Upload required documents</li>
                  <li>Review and pay the application fees</li>
                </ol>
              </div>
              
              <div class="support-section">
                <p><strong>Need Help?</strong> If you have any questions or encounter any issues during the setup process, please don't hesitate to contact our admissions office. We're here to help!</p>
              </div>
            </div>
            <div class="footer">
              <p class="footer-text">© 2024 KALNET School Management System. All rights reserved.</p>
              <div class="footer-links">
                <a href="#">Help Center</a> | <a href="#">Contact Support</a> | <a href="#">Privacy Policy</a>
              </div>
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
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admission Status Update - KALNET</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; background-color: #f3f4f6; line-height: 1.6; }
          .wrapper { background-color: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
          .message { font-size: 15px; color: #4b5563; margin-bottom: 24px; line-height: 1.8; }
          .reference-box { background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px solid #9ca3af; border-radius: 8px; padding: 20px; margin: 24px 0; }
          .reference-item { margin: 12px 0; }
          .reference-label { font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px; }
          .reference-value { font-size: 16px; font-weight: 700; color: #1f2937; margin-top: 4px; }
          .next-steps { background-color: #f9fafb; border-left: 4px solid #6b7280; padding: 16px; border-radius: 6px; margin: 24px 0; }
          .next-steps p { font-size: 14px; color: #4b5563; line-height: 1.8; }
          .contact-info { background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center; }
          .contact-info p { font-size: 14px; color: #4b5563; margin: 8px 0; }
          .contact-info strong { color: #1f2937; }
          .footer { background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer-text { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
          .footer-links { font-size: 12px; }
          .footer-links a { color: #6b7280; text-decoration: none; margin: 0 8px; }
          .footer-links a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>📋 Admission Status Update</h1>
              <p>KALNET School Management System</p>
            </div>
            <div class="content">
              <p class="greeting">Dear Parent/Guardian,</p>
              <p class="message">Thank you for your interest in KALNET School. We appreciate the time and effort you invested in the admission process.</p>
              
              <p class="message">We regret to inform you that the admission enquiry for <strong>${studentName}</strong> has not been approved at this time. This decision was made after careful consideration of all applications received.</p>
              
              <div class="reference-box">
                <div class="reference-item">
                  <div class="reference-label">📋 Reference Number</div>
                  <div class="reference-value">${referenceNumber}</div>
                </div>
              </div>
              
              <div class="next-steps">
                <p><strong>What Next?</strong></p>
                <p>We encourage you to apply again in future admission cycles. Your child may also be considered for other programs or classes that might be a better fit. Please feel free to reach out to our admissions office to discuss alternative options.</p>
              </div>
              
              <div class="contact-info">
                <p><strong>📞 Contact Our Admissions Office</strong></p>
                <p>We're here to help and answer any questions you may have about the admission process or future opportunities.</p>
              </div>
              
              <p style="font-size: 14px; color: #4b5563; margin-top: 24px;">We wish your child all the best in their academic journey.</p>
            </div>
            <div class="footer">
              <p class="footer-text">© 2024 KALNET School Management System. All rights reserved.</p>
              <div class="footer-links">
                <a href="#">Help Center</a> | <a href="#">Contact Support</a> | <a href="#">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}


// Sign-Up Verification Email Template
export function getSignUpVerificationTemplate(otp: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to KALNET - Email Verification</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; background-color: #f3f4f6; line-height: 1.6; }
          .wrapper { background-color: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
          .welcome-message { font-size: 15px; color: #4b5563; margin-bottom: 24px; line-height: 1.8; }
          .otp-container { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; border-radius: 8px; padding: 30px; text-align: center; margin: 32px 0; }
          .otp-label { font-size: 12px; font-weight: 600; color: #0369a1; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .otp-code { font-size: 42px; font-weight: 700; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .next-steps { margin: 32px 0; }
          .next-steps h3 { font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
          .next-steps ol { margin-left: 20px; }
          .next-steps li { font-size: 14px; color: #4b5563; margin-bottom: 10px; line-height: 1.6; }
          .expiry-notice { font-size: 12px; color: #6b7280; background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 24px 0; }
          .security-note { font-size: 13px; color: #4b5563; margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #6b7280; }
          .security-note strong { color: #1f2937; }
          .features-box { background-color: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 24px 0; }
          .features-box h4 { font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 12px; }
          .features-box ul { margin-left: 20px; }
          .features-box li { font-size: 13px; color: #4b5563; margin-bottom: 8px; }
          .footer { background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer-text { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
          .footer-links { font-size: 12px; }
          .footer-links a { color: #3b82f6; text-decoration: none; margin: 0 8px; }
          .footer-links a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>🎓 Welcome to KALNET!</h1>
              <p>School Management System</p>
            </div>
            <div class="content">
              <p class="greeting">Hello,</p>
              <p class="welcome-message">Thank you for creating an account with KALNET School Management System. We're excited to have you on board!</p>
              
              <p style="font-size: 15px; color: #4b5563; margin-bottom: 24px;">To verify your email address and complete your registration, please use the verification code below:</p>
              
              <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="expiry-notice">
                ⏱️ This code will expire in <strong>10 minutes</strong>. Please enter it promptly.
              </div>
              
              <div class="next-steps">
                <h3>📝 What's Next?</h3>
                <ol>
                  <li>Enter this verification code on the verification page</li>
                  <li>Complete your admission enquiry form</li>
                  <li>Upload required documents</li>
                  <li>Track your application status in real-time</li>
                  <li>Receive updates and notifications</li>
                </ol>
              </div>
              
              <div class="features-box">
                <h4>✨ What You Can Do:</h4>
                <ul>
                  <li>Submit and track admission enquiries</li>
                  <li>View announcements and updates</li>
                  <li>Access student portal</li>
                  <li>Manage fees and payments</li>
                  <li>Request and track leave applications</li>
                </ul>
              </div>
              
              <div class="security-note">
                <strong>🔒 Security Tip:</strong> Never share this code with anyone. KALNET staff will never ask for your verification code via email or phone.
              </div>
              
              <p style="font-size: 14px; color: #4b5563; margin-top: 24px;">If you didn't create this account, please ignore this email or contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p class="footer-text">© 2024 KALNET School Management System. All rights reserved.</p>
              <div class="footer-links">
                <a href="#">Help Center</a> | <a href="#">Contact Support</a> | <a href="#">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
