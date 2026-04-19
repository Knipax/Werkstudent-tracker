import { NextRequest, NextResponse } from "next/server";
import { getAllJobs, createJob } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const jobs = await getAllJobs();
    return NextResponse.json(jobs);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, company, link, status, notes, location, salary } = body;
    if (!title || !company) {
      return NextResponse.json({ error: "title and company required" }, { status: 400 });
    }
    const job = {
      id: randomUUID(),
      title,
      company,
      link: link || "",
      status: status || "applied",
      notes: notes || "",
      location: location || "",
      salary: salary || "",
      applied_at: new Date().toISOString(),
    };
    await createJob(job);
    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
