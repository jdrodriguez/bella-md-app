import { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service — BellaMD",
  description:
    "The terms and conditions governing your use of BellaMD.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: March 2026
        </p>

        <div className="mt-12 space-y-10">
          {/* Acceptance */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              By purchasing, downloading, installing, or using BellaMD, you
              agree to be bound by these Terms of Service. If you do not agree to
              these terms, do not use BellaMD. These terms constitute a legal
              agreement between you and Integrum (&quot;we&quot;,
              &quot;us&quot;, &quot;our&quot;), the maker of BellaMD.
            </p>
          </section>

          {/* License Grant */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              2. License Grant
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              Upon purchase of a valid subscription, we grant you a personal,
              non-exclusive, non-transferable, revocable license to install and
              use BellaMD on up to three (3) devices that you own or control.
              This license is valid for the duration of your active subscription.
            </p>
          </section>

          {/* Subscription and Billing */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              3. Subscription and Billing
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-foreground/90">
              <li>
                BellaMD is offered as an annual subscription at $25 per year.
              </li>
              <li>
                All payments are processed securely through Stripe. We do not
                store your payment card details.
              </li>
              <li>
                Your subscription will automatically renew at the end of each
                billing period unless you cancel before the renewal date.
              </li>
              <li>
                You may cancel your subscription at any time through your
                account page. Cancellation takes effect at the end of the current
                billing period — you will retain access until then.
              </li>
            </ul>
          </section>

          {/* Refund Policy */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              4. Refund Policy
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              We offer a 14-day money-back guarantee from the date of purchase.
              If you are not satisfied with BellaMD for any reason, contact us
              within 14 days and we will issue a full refund, no questions asked.
              Refund requests after 14 days will be evaluated on a case-by-case
              basis.
            </p>
          </section>

          {/* Prohibited Use */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              5. Prohibited Use
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              You agree not to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-foreground/90">
              <li>
                Reverse engineer, decompile, disassemble, or otherwise attempt
                to derive the source code of BellaMD.
              </li>
              <li>
                Share, distribute, sublicense, or transfer your license key to
                any other person or entity.
              </li>
              <li>
                Circumvent, disable, or interfere with the licensing or
                activation mechanisms of the software.
              </li>
              <li>
                Use BellaMD for any purpose that violates applicable local,
                state, national, or international law.
              </li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              6. Intellectual Property
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              BellaMD, including all code, design, trademarks, and
              documentation, is and remains the exclusive property of Integrum.
              Your subscription grants a license to use the software — it does
              not transfer any ownership rights. All content you create using
              BellaMD belongs entirely to you.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              7. Limitation of Liability
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              To the maximum extent permitted by applicable law, Integrum shall
              not be liable for any indirect, incidental, special, consequential,
              or punitive damages, or any loss of profits, data, or goodwill,
              arising out of or in connection with your use of BellaMD, even if
              we have been advised of the possibility of such damages.
            </p>
            <p className="text-base leading-7 text-foreground/90">
              Our total aggregate liability for any claim arising from or related
              to these terms or the use of BellaMD shall not exceed the amount
              you paid us in the twelve (12) months preceding the claim.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              8. Disclaimer of Warranties
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              BellaMD is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, whether express or
              implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement. We do not warrant that BellaMD will be
              uninterrupted, error-free, or free of harmful components.
            </p>
          </section>

          {/* Termination */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              9. Termination
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              We may suspend or terminate your license and access to BellaMD at
              any time if you violate these Terms of Service. Upon termination,
              your right to use the software ceases immediately. Sections
              regarding intellectual property, limitation of liability,
              disclaimer of warranties, and governing law survive termination.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              10. Changes to These Terms
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              We reserve the right to modify these Terms of Service at any time.
              If we make material changes, we will notify you by email or by
              posting a notice on our website. Your continued use of BellaMD
              after such changes constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              11. Governing Law
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              These terms shall be governed by and construed in accordance with
              the laws of the State of New Jersey, United States of America,
              without regard to its conflict-of-law provisions. Any disputes
              arising from these terms or your use of BellaMD shall be subject
              to the exclusive jurisdiction of the courts located in the State of
              New Jersey.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              12. Contact Us
            </h2>
            <p className="text-base leading-7 text-foreground/90">
              If you have questions about these Terms of Service, contact us at{" "}
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
