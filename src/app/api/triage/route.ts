import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(request: Request) {
  try {
    const data = await dbHelper.getTriageItems();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, source, sender } = body;
    if (!title || !source || !sender) {
      return NextResponse.json({ error: "title, source, and sender are required" }, { status: 400 });
    }
    const data = await dbHelper.createTriageItem({
      title,
      description: description || "",
      source,
      sender,
      status: "new"
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }
    const data = await dbHelper.updateTriageItem(id, { status });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
