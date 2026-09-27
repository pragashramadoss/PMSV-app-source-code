import Link from 'next/link';

export const metadata = {
  title: 'About us | PMSV Food Safety Updates',
  description: 'About PMSV Food Safety Updates and Pragash Ramadoss.',
};

export default function AboutPage() {
  return <main className="privacy-page about-page">
    <Link href="/">← Back to PMSV</Link>
    <header><img src="/icons/pmsv-family-64.png" alt="PMSV" width="64" height="64"/><div><h1>About us</h1><p>PMSV Food Safety Updates</p></div></header>
    <h2>About PMSV</h2>
    <p>PMSV Food Safety Updates is an independent initiative created with the idea of helping fellow food safety and quality professionals access useful regulatory, food safety, quality, process excellence and certification updates in one place.</p>

    <h2>About me</h2>
    <p><strong>Pragash Ramadoss</strong></p>
    <p>I am doing this with an idea to help fellow food safety and quality professionals.</p>

    <h2>Contact</h2>
    <p><strong>Email:</strong> <a href="mailto:pragash.ramadoss@gmail.com">pragash.ramadoss@gmail.com</a><br/>
    <strong>Mobile:</strong> <a href="tel:+919769076827">+91-9769076827</a></p>

    <p>PMSV is independent of the regulators, certification bodies and organisations referenced in the app. Always read the original source for authoritative requirements.</p>
    <Link href="/">Return to PMSV Food Safety Updates</Link>
  </main>;
}
