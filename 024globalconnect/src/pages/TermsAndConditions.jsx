import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Section = ({ number, title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-3">
      {number}. {title}
    </h2>
    <div className="text-gray-700 space-y-3 leading-relaxed">{children}</div>
  </div>
);

const BulletList = ({ items }) => (
  <ul className="list-disc ml-5 space-y-1">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="bg-blue-900 text-white rounded-2xl p-6 sm:p-8 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">024 GLOBAL: PRIVACY POLICY</h1>
          <p className="text-blue-200 text-sm">Last Updated: February 3, 2026</p>
          <p className="text-blue-200 text-sm">Effective Date: Immediately upon Registration</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10">

          <Section number="1" title="INTRODUCTION">
            <p>
              024 Global ("we", "us", or "our") respects your privacy and is committed to protecting
              your personal data. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website 024global.com, use our mobile web
              application, or engage with our services (the "Platform").
            </p>
            <p>By using our Platform, you consent to the data practices described in this policy.</p>
          </Section>

          <Section number="2" title="INFORMATION WE COLLECT">
            <p>
              We collect information that identifies you personally and information that is necessary
              for the proper functioning of the agricultural ecosystem.
            </p>

            <div className="mt-3">
              <h3 className="font-semibold text-gray-800 mb-2">2.1 Personal Information</h3>
              <p className="mb-2">
                When you register as a Farmer, Affiliate, Service Provider, or Buyer, we collect:
              </p>
              <BulletList items={[
                'Identity Data: Name, National ID Number (for verification), and Company Registration details (for Vets/corporates).',
                'Contact Data: Phone number (primary identifier), email address, and physical address.',
                'Profile Data: Photographs (profile pictures), professional skills, and biography.',
              ]} />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">2.2 Agricultural & Business Data</h3>
              <p className="mb-2">To facilitate trade, we collect:</p>
              <BulletList items={[
                'Produce Data: Photos of crops, quantity estimates, and quality grades.',
                'Service Data: Availability hours, service radius, and pricing rates.',
              ]} />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">2.3 Location Data (Crucial)</h3>
              <p className="mb-2">
                024 Global is a location-based service. We collect GPS Coordinates when you use the
                app to:
              </p>
              <BulletList items={[
                'Pinpoint farm locations for buyers.',
                'Match Service Providers (Vets/Laborers) to nearby jobs.',
                'Calculate logistics and delivery fees.',
              ]} />
              <p className="mt-2">
                You may disable location services in your browser/device settings, but this will
                limit your ability to use core features like "Find a Vet" or "Sell Produce."
              </p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">2.4 Financial Data</h3>
              <p className="mb-2">
                We collect data necessary to process payments and withdrawals:
              </p>
              <BulletList items={[
                'Wallet Data: Transaction history, earnings, and withdrawal requests.',
                'Payment Details: M-Pesa numbers or Bank Account details for payouts.',
              ]} />
              <p className="mt-2 font-medium">
                Note: We DO NOT store your full credit/debit card numbers or sensitive authentication
                pins. (See Section 4: Payment Processing).
              </p>
            </div>
          </Section>

          <Section number="3" title="HOW WE USE YOUR INFORMATION">
            <p>We use your data to:</p>
            <ol className="list-decimal ml-5 space-y-1 mt-2">
              <li>Provide the Service: Connect Farmers with Buyers and Service Providers.</li>
              <li>Process Transactions: Facilitate payments and split commissions via the Wallet system.</li>
              <li>Verification: Allow Affiliates to verify the legitimacy of farmers and produce (The "2Qs & 2Ps").</li>
              <li>Communication: Send order confirmations, job alerts (via App and WhatsApp), and support messages.</li>
              <li>Digital Delivery: Automatically send access codes/links for digital products to your email/SMS.</li>
              <li>Security: Detect and prevent fraud, spam, and abuse.</li>
            </ol>
          </Section>

          <Section number="4" title="PAYMENT PROCESSING (PAYSTACK)">
            <p>We use Paystack as our third-party payment gateway provider.</p>
            <BulletList items={[
              'Data Sharing: When you make a payment on 024 Global, your payment information (Card number, CVV, Expiry, Mobile Money PIN) is processed directly by Paystack.',
              '024 Global does not store your raw credit card information on our servers. We only store a Transaction Reference code provided by Paystack to verify that payment was successful.',
              'Paystack Policy: The processing of payments is subject to Paystack\'s Privacy Policy and Terms of Service.',
            ]} />
          </Section>

          <Section number="5" title="SHARING YOUR INFORMATION">
            <p>We may share your information in the following specific situations:</p>

            <div className="mt-3">
              <h3 className="font-semibold text-gray-800 mb-2">5.1 Between Users (To fulfill the service)</h3>
              <BulletList items={[
                'Service Providers: If you book a Vet or Laborer, we share your location and contact details with them so they can find you.',
                'Buyers: If you are a Farmer/Seller, your location (Farm) and product details are visible to potential Buyers.',
                'Affiliates: Affiliates acting as your agent have access to your profile data to assist with account management and verification.',
              ]} />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">5.2 Third-Party Service Providers</h3>
              <p className="mb-2">We share data with vendors who help us run the platform:</p>
              <BulletList items={[
                'SMS/WhatsApp APIs: To send you automated notifications.',
                'Cloud Hosting: To store our database securely.',
              ]} />
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">5.3 Legal Requirements</h3>
              <p>
                We may disclose your information if required to do so by law or in response to valid
                requests by public authorities (e.g., a court order or government agency).
              </p>
            </div>
          </Section>

          <Section number="6" title="DATA SECURITY">
            <BulletList items={[
              'Encryption: All data transmitted between your browser and our servers is encrypted using SSL (Secure Socket Layer) technology.',
              'Access Control: Only authorized personnel have access to sensitive user data.',
              'Wallet Security: Withdrawal requests require administrative approval to prevent unauthorized draining of funds.',
            ]} />
            <p className="mt-3">
              While we have taken reasonable steps to secure the personal information you provide to
              us, please be aware that no security measures are perfect or impenetrable, and no method
              of data transmission can be guaranteed against interception or misuse.
            </p>
          </Section>

          <Section number="7" title="DATA RETENTION">
            <BulletList items={[
              'Active Accounts: We keep your data while your account is active.',
              'Transaction Records: We are legally required to keep financial transaction records for a minimum period (typically 5-7 years) for tax and accounting purposes.',
            ]} />
          </Section>

          <Section number="8" title="YOUR RIGHTS">
            <p>Depending on your location, you have the right to:</p>
            <ol className="list-decimal ml-5 space-y-1 mt-2">
              <li>Access: Request a copy of the personal data we hold about you.</li>
              <li>Correction: Request that we correct any incorrect data (e.g., wrong phone number).</li>
              <li>Deletion: Request that we delete your account and personal data (subject to our legal obligation to keep transaction records).</li>
              <li>Withdraw Consent: You may turn off GPS location permissions at any time via your device settings.</li>
            </ol>
            <p className="mt-3">
              To exercise these rights, please contact us via the Support Chat or email.
            </p>
          </Section>

          <Section number="9" title="CHANGES TO THIS POLICY">
            <p>
              We may update this Privacy Policy from time to time in order to reflect changes to our
              practices or for other operational, legal, or regulatory reasons. The date at the top of
              this policy indicates when it was last updated.
            </p>
          </Section>

          <Section number="10" title="CONTACT US">
            <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
            <div className="mt-2 space-y-1">
              <p><span className="font-medium">Email:</span> 024globalconnect@gmail.com</p>
              <p><span className="font-medium">Phone:</span> 0711917376</p>
            </div>
          </Section>

        </div>

        {/* Bottom back button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
