import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setSessionCookie, hashPassword } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { name, email, phone_number, password } = await request.json();

    if (!password || (!email && !phone_number)) {
      return NextResponse.json(
        { error: "Password and at least one identifier (email or phone number) are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone_number ? phone_number.trim() : null;

    // Check if email already exists
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingEmail) {
        return NextResponse.json({ error: "Email already registered." }, { status: 400 });
      }
    }

    // Check if phone number already exists
    if (cleanPhone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone_number: cleanPhone } });
      if (existingPhone) {
        return NextResponse.json({ error: "Phone number already registered." }, { status: 400 });
      }
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name || "Customer",
        email: cleanEmail,
        phone_number: cleanPhone,
        passwordHash,
        role: "USER",
        isEmailVerified: false,
        isPhoneVerified: false,
      },
    });

    // Automatically log user in upon registration
    await setSessionCookie(user.id, user.role);

    return NextResponse.json({
      success: true,
      message: "Registration successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in registration route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
