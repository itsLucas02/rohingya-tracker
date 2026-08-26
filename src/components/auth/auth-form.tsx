"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signIn, signUp, signInWithGoogle, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const t = useTranslations("auth");
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null,
  );

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          {mode === "login" ? t("loginTitle") : t("signupTitle")}
        </h1>
      </div>

      <form action={formAction} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="username">{t("username")}</Label>
            <Input id="username" name="username" required autoComplete="username" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        {state?.message === "check-email" && (
          <p className="text-sm text-status-live">{t("checkEmail")}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {mode === "login" ? t("loginCta") : t("signupCta")}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full">
          {t("googleCta")}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
        <Link
          href={mode === "login" ? "/auth/signup" : "/auth/login"}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {mode === "login" ? t("signupCta") : t("loginCta")}
        </Link>
      </p>
    </div>
  );
}
