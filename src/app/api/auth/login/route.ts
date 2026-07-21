import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setSessionCookie, hashPassword } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier (email/phone) and password are required." }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim();
    const isEmail = cleanIdentifier.includes("@");

    // Retrieve user by email or phone
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: cleanIdentifier.toLowerCase() } : { phone_number: cleanIdentifier },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    }

    // Hash input password and compare
    const computedHash = hashPassword(password);
    if (computedHash !== user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    }

    // Set cookie
    await setSessionCookie(user.id, user.role);

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
