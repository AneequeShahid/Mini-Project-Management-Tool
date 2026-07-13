import { NextResponse } from "next/server";
import { resendConnector } from "@/integrations/resend/email";

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();
    const res = await resendConnector.sendEmail(to, subject, html);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
