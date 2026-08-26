import { setRequestLocale } from "next-intl/server";

export const metadata = {
  title: "Terms of Service — TrackX",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-24">
      <h1 className="text-xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="text-sm text-text-muted">Last updated: August 24, 2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
        <p>
          By creating an account or using TrackX, you agree to these terms.
          TrackX is a community platform for reporting local safety
          incidents — theft, vandalism, hazards, suspicious activity, and
          lost &amp; found items.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Acceptable use
        </h2>
        <p>
          Reports must describe incidents, hazards, or behavior. You may
          not use TrackX to target, harass, or make claims about any person
          or group based on ethnicity, religion, nationality, or similar
          characteristics. You may not post another person&apos;s private
          identifying information without their consent. Reports or
          comments that violate these rules will be removed, and repeat
          violations may result in account suspension or termination.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Accounts
        </h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity under your account. You
          must provide accurate information when creating an account.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          User content
        </h2>
        <p>
          You retain ownership of the reports, comments, and photos you
          submit. By posting content, you grant TrackX a license to display
          that content on the map and community board. You are solely
          responsible for the accuracy of what you report.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          No warranty
        </h2>
        <p>
          TrackX is provided on a best-effort, community basis. Reports are
          submitted by users and are not verified by TrackX. We make no
          guarantee as to the accuracy, completeness, or reliability of any
          report. TrackX is not a substitute for contacting emergency
          services or local authorities.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Termination
        </h2>
        <p>
          We may suspend or terminate accounts that violate these terms or
          the content guidelines described in our Privacy Policy.
        </p>

        <h2 className="text-base font-semibold text-foreground">
          Changes to these terms
        </h2>
        <p>
          We may update these terms from time to time. Continued use of
          TrackX after changes take effect constitutes acceptance of the
          updated terms.
        </p>

        <h2 className="text-base font-semibold text-foreground">Contact</h2>
        <p>
          Questions about these terms can be sent to the app administrator
          via the contact details provided in the app.
        </p>
      </div>
    </div>
  );
}
