import Link from 'next/link';

export const metadata = {
  title: 'Privacy policy | PMSV Food Safety Updates',
  description: 'How PMSV Food Safety Updates handles notification data, device storage and privacy requests.',
};

export default function PrivacyPage() {
  return <main className="privacy-page">
    <Link href="/">← Back to PMSV</Link>
    <header><img src="/icons/pmsv-family-64.png" alt="PMSV" width="64" height="64"/><div><h1>Privacy policy</h1><p>PMSV Food Safety Updates</p></div></header>
    <p><strong>Effective date: 27 September 2026</strong></p>
    <p>PMSV Food Safety Updates is operated by Pragash Ramadoss under the PMSV name. This policy covers pmsvgroup.com and the PMSV app that displays this service. For support or privacy requests, email <a href="mailto:Pragash.ramadoss@gmail.com">Pragash.ramadoss@gmail.com</a>.</p>

    <h2>Reading and searching</h2>
    <p>You do not need an account to read PMSV. News searches run in your browser against the downloaded news archive; the app does not send your search terms to a separate analytics service. The current app does not include advertising or reader analytics trackers, or request access to your contacts, camera, microphone or precise location.</p>

    <h2>Optional notifications</h2>
    <p>Notifications require your device or browser permission. If you enable them, PMSV stores a push subscription address that identifies your browser or installation, hashed subscription and management identifiers, and timestamps used to track delivery attempts and prevent duplicate alerts. We use these records to provide the notifications you requested, manage your subscription and prevent abuse.</p>
    <p>Your browser or operating system’s push provider processes the subscription address and delivery requests. Notification content can appear on your lock screen depending on your device settings.</p>

    <h2>Device storage</h2>
    <p>PMSV stores your notification preference, a subscription management token and whether a permission prompt has been shown in your browser. A service worker caches an offline information page. This storage supports app functions and is not used for advertising. It stays on your device until it is cleared or removed by the browser.</p>

    <h2>Hosting, security and service providers</h2>
    <p>PMSV uses WordPress hosting and database infrastructure. Daily source collection and publication checks run through GitHub Actions. These services may process network and operational information needed to run and protect the service, including request details and security logs. Their infrastructure log and backup retention is governed by their own practices; PMSV does not set a fixed retention period for those records.</p>
    <p>For abuse prevention, the application stores a time-windowed hash derived from the request IP address and an attempt count. These rate-limit records expire after approximately two hours and are cleared on subsequent notification requests. Application connections use HTTPS, and subscription changes require a management token. No internet service can guarantee absolute security.</p>
    <p>PMSV does not sell notification subscription data or use it for targeted advertising. Service providers process information needed for hosting, security and notification delivery. Information may be processed outside your country.</p>

    <h2>Retention and turning notifications off</h2>
    <p>Notification registrations remain in the database while subscribed; there is no automatic age-based deletion. Use <strong>Notifications → Turn off notifications</strong> in the same browser or installation to request deletion of the server registration and unsubscribe the device. You can also revoke notification permission in your browser or device settings.</p>
    <p>If server deletion fails, an expired subscription is removed when a later delivery attempt receives an expired-address response. This may not happen immediately. Revoking permission or uninstalling alone does not guarantee immediate server deletion. Turn notifications off in PMSV before clearing browser storage, because clearing storage removes the token used to manage the registration.</p>

    <h2>Privacy requests and support</h2>
    <p>To request access, correction or deletion of data associated with your use of PMSV, email <a href="mailto:Pragash.ramadoss@gmail.com?subject=PMSV%20privacy%20request">Pragash.ramadoss@gmail.com</a> with the subject “PMSV privacy request”. PMSV has no reader accounts, and notification registrations are not linked to your email address. We may need information to identify the relevant record and verify the request. Do not send passwords or private management tokens by email.</p>
    <p>If you contact us, your email address and message are processed through Gmail to answer your request. Correspondence is retained as needed to resolve the request and keep a record of its handling; there is no automatic deletion schedule for this mailbox. You may request deletion, subject to any records that must be retained for legal or security reasons.</p>
    <p>Email and WhatsApp alert signups are discontinued. No earlier signup records were present when this policy was published.</p>

    <h2>External articles and blogs</h2>
    <p>Opening an original article, regulatory document or WordPress blog takes you to another website. Its privacy policy applies, and it may collect network information or use its own cookies. PMSV does not control these external services.</p>

    <h2>Children and policy changes</h2>
    <p>PMSV is intended for food safety and quality professionals, not specifically for children. Contact us if you believe a child has provided personal information that should be removed. Changes to this policy will be published here with an updated effective date.</p>
    <Link href="/">Return to PMSV Food Safety Updates</Link>
  </main>;
}
