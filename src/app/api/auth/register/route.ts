import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setSessionCookie, hashPassword } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { name, phone_number, password, address } = await request.json();

    if (!password || !phone_number) {
      return NextResponse.json(
        { error: "Phone number and password are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone_number ? phone_number.trim() : null;

    // Email is removed from registration

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
        email: null,
        phone_number: cleanPhone,
        address: address ? address.trim() : null,
        passwordHash,
        role: "USER",
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
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in registration route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
