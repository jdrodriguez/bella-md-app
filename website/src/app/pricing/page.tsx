import { CheckoutButton } from "./checkout-button"

const features = [
  "WYSIWYG Markdown editing",
  "Dark mode",
  "Multi-tab documents",
  "PDF & HTML export",
  "Find & Replace",
  "Up to 3 devices",
  "All future updates",
]

const faqs = [
  {
    question: "Can I use it on multiple devices?",
    answer:
      "Yes. A single license lets you activate BellaMD on up to 3 devices at the same time.",
  },
  {
    question: "What happens after I pay?",
    answer:
      "You'll receive a license key via email within minutes. Enter the key in the app to activate it.",
  },
  {
    question: "What's the refund policy?",
    answer:
      "14-day money-back guarantee, no questions asked. Just reach out and we'll process your refund.",
  },
  {
    question: "What platforms are supported?",
    answer:
      "BellaMD runs on macOS, Windows, and Linux. Download the version for your platform from the download page.",
  },
]

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-24 dark:bg-black">
      {/* Header */}
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl dark:text-zinc-50">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          One plan. Everything included. No surprises.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="mt-16 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            BellaMD Annual
          </h2>
          <div className="mt-4 flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              $25
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              / year
            </span>
          </div>
        </div>

        <ul className="mt-8 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <CheckoutButton />
        </div>

        <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          14-day money-back guarantee
        </p>
      </div>

      {/* FAQ Section */}
      <div className="mt-24 w-full max-w-2xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Frequently asked questions
        </h2>

        <dl className="mt-12 space-y-8">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {faq.question}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
