import { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy — BellaMD",
  description:
    "How BellaMD collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: March 2026
        </p>

        <div className="mt-12 space-y-10">
          {/* Intro */}
          <section className="space-y-3">
            <p className="text-base leading-7 text-foreground/90">
              BellaMD is a desktop Markdown editor built and operated by
              Integrum (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). This
              Privacy Policy explains what information we collect, how we use it,
              and the choices you have.
            </p>
          </section>

          {/* What We Collect */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Information We Collect
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              When you create an account and purchase a license, we collect:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-foreground/90">
              <li>
                <strong>Account information:</strong> your name and email
                address.
              </li>
              <li>
                <strong>Payment information:</strong> payment details are
                collected and processed entirely by Stripe. We do not store your
                credit card number or bank details on our servers.
              </li>
              <li>
                <strong>Machine identifiers:</strong> when you activate BellaMD
                on a device, we record a machine identifier so we can enforce the
                per-license device limit.
              </li>
              <li>
                <strong>Usage data:</strong> the app sends periodic heartbeat
                timestamps to verify that your license is active. These contain
                only a timestamp and your machine identifier — no content or
                behavioral data.
              </li>
            </ul>
          </section>

          {/* What We Don't Collect */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Information We Do Not Collect
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              BellaMD is a local-first application. Your documents, file
              contents, and file names never leave your device. We have no access
              to anything you write in the editor. There is no cloud sync, no
              telemetry on your writing, and no analytics tracking your editing
              behavior.
            </p>
          </section>

          {/* How We Use Data */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              How We Use Your Information
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-foreground/90">
              <li>
                <strong>Account management:</strong> to create and maintain your
                account, and to provide customer support.
              </li>
              <li>
                <strong>License validation:</strong> to verify that your license
                is active and within the allowed device limit.
              </li>
              <li>
                <strong>Payment processing:</strong> to process your subscription
                payment and handle renewals, cancellations, and refunds through
                Stripe.
              </li>
              <li>
                <strong>Email communication:</strong> to send you your license
                key, payment receipts, and important account-related notices.
              </li>
            </ul>
          </section>

          {/* Third Parties */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Third-Party Services
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              We share information with the following third-party services only
              as necessary to operate BellaMD:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-foreground/90">
              <li>
                <strong>Stripe:</strong> processes all payments. Stripe receives
                your payment information directly and is governed by the{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:text-accent/80"
                >
                  Stripe Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Resend:</strong> delivers transactional emails (license
                keys, receipts). Resend receives your email address and is
                governed by the{" "}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:text-accent/80"
                >
                  Resend Privacy Policy
                </a>
                .
              </li>
            </ul>
            <p className="text-base leading-7 text-foreground/90">
              We do not sell, rent, or trade your personal information to any
              third party.
            </p>
          </section>

          {/* Data Retention */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Data Retention
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              We retain your account data for as long as your account is active
              or as needed to provide you with the service. If you request
              deletion of your account, we will remove your personal data from
              our systems within 30 days, except where we are required to retain
              it for legal or financial record-keeping purposes.
            </p>
          </section>

          {/* Cookies */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
            <p className="text-base leading-7 text-foreground/90">
              We use cookies solely for authentication session management. These
              cookies are strictly necessary to keep you logged in to your
              account on this website. We do not use tracking cookies, analytics
              cookies, or any third-party advertising cookies.
            </p>
          </section>

          {/* Your Rights */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Your Rights
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              You have the right to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-foreground/90">
              <li>
                <strong>Access</strong> the personal data we hold about you.
              </li>
              <li>
                <strong>Correct</strong> inaccurate or incomplete information.
              </li>
              <li>
                <strong>Delete</strong> your account and personal data.
              </li>
            </ul>
            <p className="text-base leading-7 text-foreground/90">
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:support@bellamarkdown.com"
                className="text-accent underline underline-offset-2 hover:text-accent/80"
              >
                support@bellamarkdown.com
              </a>
              .
            </p>
          </section>

          {/* Changes */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Changes to This Policy
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              We may update this Privacy Policy from time to time. If we make
              material changes, we will notify you by email or by posting a
              notice on this page. Your continued use of BellaMD after such
              changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Contact Us
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              If you have questions about this Privacy Policy, contact us at{" "}
              <a
                href="mailto:support@bellamarkdown.com"
                className="text-accent underline underline-offset-2 hover:text-accent/80"
              >
                support@bellamarkdown.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
