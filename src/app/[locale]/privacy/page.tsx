import { setRequestLocale } from "next-intl/server";

export const metadata = {
  title: "Privacy Policy — TrackX",
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-24">
      <h1 className="text-xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-text-muted">Last updated: August 24, 2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
        <p>
          TrackX is a community platform for reporting local safety incidents
          — theft, vandalism, hazards, suspicious activity, and lost &amp;
          found items. This page explains what information we collect and
          how it is used.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Information we collect
        </h2>
        <p>
          When you create an account, we collect your email address,
          password (stored securely, never in plain text), and a username
          you choose. When you submit a report, we collect the content you
          provide: a title, description, category, location, and any photos
          you attach.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          How we use your information
        </h2>
        <p>
          Your account information is used to authenticate you and attribute
          reports and comments to your username. Report content is shown
          publicly on the map and board so other community members can see
          and respond to it. We do not sell or share your personal
          information with third parties for advertising purposes.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Where your data is stored
        </h2>
        <p>
          Account and report data is stored in a self-hosted Supabase
          (PostgreSQL) database. Photos are stored in Cloudflare R2 object
          storage. Both are operated under standard industry security
          practices, including encrypted connections (HTTPS/TLS) for all
          data in transit.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Sign in with Google
        </h2>
        <p>
          If you choose to sign in with Google, we receive your name, email
          address, and profile picture from Google to create your TrackX
          account. We do not receive or request access to any other Google
          account data.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Content guidelines
        </h2>
        <p>
          Reports must describe incidents, hazards, or behavior — not target
          any person or group by ethnicity, religion, or nationality.
          Content that violates this policy will be removed, and repeat
          violations may result in account suspension.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Your choices
        </h2>
        <p>
          You can edit or delete your reports and comments at any time from
          your profile. To delete your account entirely, contact us using
          the details below and we will remove your account and associated
          personal data.
        </p>

        <h2 className="text-base font-semibold text-foreground">Contact</h2>
        <p>
          Questions about this policy can be sent to the app administrator
          via the contact details provided in the app.
        </p>
      </div>
    </div>
  );
}
