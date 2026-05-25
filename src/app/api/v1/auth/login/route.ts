import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession, formatUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("بيانات الدخول غير صالحة", 400, validated.error.format());
    }

    const { phone, password } = validated.data;

    const user = await db.user.findUnique({
      where: { phone },
      include: {
        captainProfile: true,
      },
    });

    if (!user || !(await verifyPassword(password, user.password))) {
      return errorResponse("رقم الهاتف أو كلمة المرور غير صحيحة", 401);
    }

    if (!user.isActive) {
      return errorResponse("هذا الحساب معطل", 403);
    }

    const session = await createSession(user.id);

    return successResponse({
      token: session.token,
      user: formatUser(user),
      expiresAt: session.expiresAt,
    }, "تم تسجيل الدخول بنجاح");
  } catch (error) {
    console.error("Login Error:", error);
    return errorResponse("حدث خطأ أثناء تسجيل الدخول", 500);
  }
}
