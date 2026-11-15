'use client';

import {useEffect, useSyncExternalStore} from 'react';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, Download, Globe2, Laptop, Monitor, Smartphone, Check, ExternalLink} from 'lucide-react';
import './downloads.css';

const releaseBase = 'https://github.com/pragashramadoss/PMSV-app-source-code/releases/download/desktop-v2.2.0/';
type Device = 'android' | 'iphone' | 'windows' | 'mac' | '';
const subscribeToDevice = () => () => {};
const serverDevice = (): Device => '';
function detectDevice(): Device {
  const ua = navigator.userAgent;
  return /Android/i.test(ua) ? 'android' : /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) ? 'iphone' : /Windows/i.test(ua) ? 'windows' : /Mac/i.test(ua) ? 'mac' : '';
}

export default function DownloadsPage() {
  const device = useSyncExternalStore(subscribeToDevice, detectDevice, serverDevice);
  useEffect(() => {
    document.title = 'Download PMSV | Android, iPhone, Windows & Mac';
  }, []);
  const badge = (platform: Device, text: string) => <span className={'download-badge' + (device === platform ? ' is-device' : '')}>{device === platform ? <><Check size={13}/>For your device</> : text}</span>;

  return <div className="downloads-page">
    <header className="downloads-header">
      <Link href="/" className="downloads-brand"><img src="/icons/pmsv-family-64.png" width="44" height="44" alt=""/><span><strong>PMSV</strong><small>Food Safety & Quality Forum</small></span></Link>
      <Link href="/" className="downloads-back"><ArrowLeft size={16}/><span>Back to PMSV</span></Link>
    </header>
    <main className="downloads-main">
      <section className="downloads-intro" aria-labelledby="download-title">
        <p className="downloads-eyebrow">ONE FORUM. YOUR CHOICE OF DEVICE.</p>
        <h1 id="download-title">Download PMSV</h1>
        <p>Food safety updates, audits and licence tools.<br className="downloads-wide-break"/> Choose the version for your phone or computer.</p>
        <div className="downloads-features"><span><Check size={15}/>Free to use</span><span><Check size={15}/>No account needed to read</span><span><Check size={15}/>Same familiar PMSV interface</span></div>
      </section>

      <section className="download-grid" aria-label="Choose your platform">
        <article className={'download-card' + (device === 'android' ? ' for-device' : '')} id="android">
          <div className="download-card-top"><span className="platform-icon android"><Smartphone size={27}/></span>{badge('android', 'Android app')}</div>
          <h2>Android</h2><p className="download-card-description">The PMSV app for your phone, with audit and licence tools included for offline use.</p>
          <p className="download-meta">Version 2.1.0 · 13.3 MB · Android 8.0+</p>
          <a className="download-action" href="/?pmsv_android=1" download="PMSV-2.1.0-Android.apk"><Download size={17}/>Download Android APK</a>
          <p className="download-note">Direct download from PMSV. Your phone may ask you to allow installation from your browser.</p>
        </article>

        <article className={'download-card' + (device === 'iphone' ? ' for-device' : '')} id="iphone">
          <div className="download-card-top"><span className="platform-icon iphone"><Smartphone size={27}/></span>{badge('iphone', 'Home Screen web app')}</div>
          <h2>iPhone & iPad</h2><p className="download-card-description">Keep PMSV on your Home Screen and open it in its own app window using Safari.</p>
          <p className="download-meta">Web app · No App Store download required</p>
          <a className="download-action" href="#iphone-install"><Smartphone size={17}/>Set up on iPhone<ArrowRight size={16}/></a>
          <p className="download-note">The native iPhone app is not available yet. Use the Home Screen web app with an internet connection.</p>
        </article>

        <article className={'download-card' + (device === 'windows' ? ' for-device' : '')} id="windows">
          <div className="download-card-top"><span className="platform-icon windows"><Monitor size={27}/></span>{badge('windows', 'Desktop preview')}</div>
          <h2>Windows PC</h2><p className="download-card-description">A dedicated desktop app with local audit tools, saved assessments and report downloads.</p>
          <p className="download-meta">Version 2.2.0 preview · 122 MB · x64</p>
          <a className="download-action" href={releaseBase + 'PMSV-2.2.0-Windows-x64-Preview.exe'}><Download size={17}/>Download for Windows</a>
          <p className="download-note">Unsigned preview. Windows may show an unknown-publisher warning. A signed release is still pending.</p>
        </article>

        <article className={'download-card' + (device === 'mac' ? ' for-device' : '')} id="mac">
          <div className="download-card-top"><span className="platform-icon mac"><Laptop size={27}/></span>{badge('mac', 'Desktop preview')}</div>
          <h2>Mac</h2><p className="download-card-description">PMSV for MacBook, iMac and Mac mini. Choose the download that matches your Mac’s chip.</p>
          <p className="download-meta">Version 2.2.0 preview · DMG installer</p>
          <div className="mac-downloads"><a className="download-action" href={releaseBase + 'PMSV-2.2.0-Mac-arm64-Preview.dmg'}><Download size={17}/><span>Apple silicon<small>M-series · 120.5 MB</small></span></a><a className="download-action secondary" href={releaseBase + 'PMSV-2.2.0-Mac-x64-Preview.dmg'}><Download size={17}/><span>Intel<small>127.8 MB</small></span></a></div>
          <p className="download-note">Developer preview; not Apple-notarized. macOS may block installation. You can use PMSV in your browser while signing is completed.</p>
        </article>
      </section>

      <section className="iphone-install" id="iphone-install" aria-labelledby="iphone-install-title" tabIndex={-1}>
        <div><p className="downloads-eyebrow">IPHONE & IPAD</p><h2 id="iphone-install-title">Add PMSV to your Home Screen</h2><p>Open <a href="https://pmsvgroup.com/">pmsvgroup.com</a> in Safari, then follow these steps.</p></div>
        <ol><li><span>1</span><div><strong>Open the Share menu</strong><p>Tap Share in Safari. Depending on your iOS version, it may be inside the More menu.</p></div></li><li><span>2</span><div><strong>Choose Add to Home Screen</strong><p>Scroll through the actions. Turn on “Open as Web App” if that option is shown.</p></div></li><li><span>3</span><div><strong>Tap Add</strong><p>Open PMSV from its new Home Screen icon whenever you need it.</p></div></li></ol>
        <a className="downloads-help-link" href="https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios" target="_blank" rel="noopener noreferrer">Apple’s installation guide<ExternalLink size={14}/></a>
      </section>

      <section className="download-faq" aria-label="Installation help">
        <h2>A few useful details</h2>
        <details><summary>Which Mac download should I choose?</summary><p>Open the Apple menu → About This Mac. If you see an Apple M-series chip, choose Apple silicon. If it lists an Intel processor, choose Intel.</p></details>
        <details><summary>Will my saved audits appear on another device?</summary><p>Saved audits and assessments stay on the device and app where you created them. There is no automatic sync between the website, Android, Windows and Mac. Export important records before uninstalling or clearing app data.</p></details>
        <details><summary>What works without internet?</summary><p>The Android and desktop installers include audit and licence tools for offline use. News refreshes and discussions need internet. The iPhone Home Screen option uses the website and needs internet for normal use.</p></details>
        <details><summary>What does “preview” mean?</summary><p>The Windows and Mac builds have passed installation and app checks, but publisher signing is not complete. They may show security warnings or be blocked by your computer. Do not disable your device’s security protections. You can continue using PMSV in a browser.</p><p><a href="https://github.com/pragashramadoss/PMSV-app-source-code/releases/tag/desktop-v2.2.0" target="_blank" rel="noopener noreferrer">Release notes and file checksums</a></p></details>
      </section>
      <aside className="downloads-browser"><Globe2 size={25}/><div><strong>Prefer to use your browser?</strong><p>Open PMSV on any device, with no download.</p></div><Link href="/">Open PMSV<ArrowRight size={16}/></Link></aside>
    </main>
    <footer className="downloads-footer"><span>PMSV · Food Safety & Quality Forum</span><Link href="/privacy">Privacy & support</Link></footer>
  </div>;
}
