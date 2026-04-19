import { getAllJobs } from "@/lib/db";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const jobs = await getAllJobs();
  return <Dashboard initialJobs={jobs as any} />;
}
