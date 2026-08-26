import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { ReportForm } from "@/components/report/report-form";

export default async function NewReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getUser())) redirect("/auth/login");

  return <ReportForm />;
}
