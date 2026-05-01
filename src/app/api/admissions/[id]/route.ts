import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hashPassword, generateRandomPassword } from "@/lib/password";
import { sendEmail, getAdmissionApprovalTemplate, getAdmissionRejectionTemplate } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user    = session?.user as any;
    if (!session || user?.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id   = parseInt(params.id);
    const body = await req.json();
    const { status } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const admission = await db.admission.findUnique({ where: { id } });
    if (!admission) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.admission.update({
      where: { id },
      data:  { 
        status,
        approvedAt: status === "APPROVED" ? new Date() : undefined,
        approvedBy: status === "APPROVED" ? user.email : undefined,
      },
    });

    // Phase 2 & 3: Auto-create student account on approval with secure credentials
    let newStudent = null;
    let credentials = null;

    if (status === "APPROVED") {
      // Generate roll number: KN-YYYY-XXX (next available)
      const year      = new Date().getFullYear();
      const count     = await db.student.count();
      const rollNumber = `KN-${year}-${String(count + 1).padStart(3, "0")}`;

      // Generate email from name: firstname.lastname@kalnet.edu
      const nameParts  = admission.studentName.trim().toLowerCase().split(" ");
      const baseEmail  = `${nameParts[0]}${nameParts[1] ? "." + nameParts[1] : ""}@kalnet.edu`;

      // Ensure email uniqueness by appending count if needed
      const emailExists = await db.student.findUnique({ where: { email: baseEmail } });
      const finalEmail  = emailExists ? `${nameParts[0]}${count + 1}@kalnet.edu` : baseEmail;

      // Generate random password
      const tempPassword = generateRandomPassword(12);
      const hashedPassword = await hashPassword(tempPassword);

      newStudent = await db.student.create({
        data: {
          name:          admission.studentName,
          email:         finalEmail,
          password:      hashedPassword,
          phone:         admission.phone,
          parentName:    admission.parentName,
          classEnrolled: admission.classApplied,
          rollNumber,
          admissionDate: new Date(),
          isActive:      true,
        },
      });

      credentials = {
        email:      finalEmail,
        password:   tempPassword,
        rollNumber: rollNumber,
        name:       newStudent.name,
      };

      // Phase 2: Send approval email with credentials
      const approvalEmail = getAdmissionApprovalTemplate(
        admission.studentName,
        admission.referenceNumber,
        finalEmail,
        tempPassword,
        rollNumber
      );

      await sendEmail({
        to: admission.email,
        subject: `Admission Approved - ${admission.referenceNumber}`,
        html: approvalEmail,
      });
    } else if (status === "REJECTED") {
      // Phase 2: Send rejection email
      const rejectionEmail = getAdmissionRejectionTemplate(
        admission.studentName,
        admission.referenceNumber
      );

      await sendEmail({
        to: admission.email,
        subject: `Admission Status Update - ${admission.referenceNumber}`,
        html: rejectionEmail,
      });
    }

    return NextResponse.json({
      admission: updated,
      ...(newStudent && {
        studentCreated: true,
        credentials,
      }),
    });
  } catch (error) {
    console.error("Admission PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
