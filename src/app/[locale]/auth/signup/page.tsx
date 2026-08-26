import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { AuthForm } from "@/components/auth/auth-form";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await getUser()) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <AuthForm mode="signup" />
    </div>
  );
}
