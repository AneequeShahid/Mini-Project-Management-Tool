import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = {
      name: body.name,
      start_date: body.startDate || body.start_date,
      end_date: body.endDate || body.end_date,
      status: body.status,
    };
    const cleanUpdate = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));

    const { data, error } = await supabaseServer.from("sprints").update(cleanUpdate).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabaseServer.from("sprints").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Sprint deleted" });
}
