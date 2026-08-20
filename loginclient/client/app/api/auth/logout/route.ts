import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/sign-in", request.url));
  response.cookies.delete("auth_token");
  return response;
}