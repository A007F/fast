import { NextResponse } from "next/server";

export function successResponse(data: any, message?: string, meta?: any) {
  return NextResponse.json({
    success: true,
    data,
    message,
    meta,
    error: null,
  });
}

export function errorResponse(message: string, status: number = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      message,
      error: message,
      details,
    },
    { status }
  );
}
