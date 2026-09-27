import Link from 'next/link';

export const metadata = {
  title: 'About me | PMSV Food Safety Updates',
  description: 'Professional profile of Pragash Ramadoss, founder of PMSV Food Safety Updates.',
};

export default function AboutPage() {
  return <main className="privacy-page about-page">
    <Link href="/">← Back to PMSV</Link>
    <header><img src="/icons/pmsv-family-64.png" alt="PMSV" width="64" height="64"/><div><h1>About me</h1><p>Pragash Ramadoss · Food Safety, Quality & Process Excellence</p></div></header>

    <h2>Professional profile</h2>
    <p>I am <strong>Pragash Ramadoss</strong>, a food safety, quality and process excellence professional with more than 13 years of experience across food manufacturing, food ingredients and multi-site quality systems.</p>
    <p>My experience includes central quality governance across multiple food categories, supplier quality and audits, QMS and FSMS, HACCP, food safety certification systems, new-unit and acquisition quality-system development, complaint reduction, process capability, continuous improvement and quality culture.</p>
    <p>I have worked in central quality at <strong>ITC Foods</strong> and previously held quality leadership roles with <strong>Naturex and Givaudan</strong>.</p>

    <h2>Education</h2>
    <p><strong>B.Tech – Industrial Biotechnology</strong><br/>Anna University, College of Engineering Guindy</p>
    <p><strong>Master’s – Sustainable Food Manufacturing Management</strong><br/>Junia ISA, Lille, France</p>

    <h2>Professional qualifications</h2>
    <ul className="about-credentials">
      <li>Project Management Professional (PMP)</li>
      <li>ASQ Certified Manager of Quality/Organizational Excellence (CMQ/OE)</li>
      <li>Highfield Level 5 Food Safety Management – Distinction</li>
      <li>Highfield Level 4 HACCP for Management</li>
      <li>FSSC 22000 Lead Auditor</li>
      <li>BRCGS Lead Auditor</li>
      <li>Lean Six Sigma Black Belt</li>
      <li>PCQI and SQF Advanced training</li>
    </ul>

    <h2>Why I built PMSV</h2>
    <p>PMSV Food Safety Updates is an independent initiative built to help fellow food safety and quality professionals find useful regulatory, food safety, quality, process excellence and certification updates in one place, with links back to the original sources.</p>

    <h2>Connect</h2>
    <p><a href="https://www.linkedin.com/in/pragashramadoss/" target="_blank" rel="noopener noreferrer"><strong>LinkedIn – Pragash Ramadoss</strong></a></p>
    <p><strong>Email:</strong> <a href="mailto:pragash.ramadoss@gmail.com">pragash.ramadoss@gmail.com</a><br/>
    <strong>Mobile:</strong> <a href="tel:+919769076827">+91-9769076827</a></p>

    <p>PMSV is independent of the regulators, certification bodies and organisations referenced in the app. Always read the original source for authoritative requirements.</p>
    <Link href="/">Return to PMSV Food Safety Updates</Link>
  </main>;
}
