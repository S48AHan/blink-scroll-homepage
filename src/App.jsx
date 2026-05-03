import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Apple,
  BadgeCheck,
  Building2,
  ChevronRight,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import Phone3D from "./Phone3D.jsx";

const beats = [
  {
    side: "left",
    label: "Beat 00",
    title: "blink — nothing like it.",
    copy: "A digital banking experience that keeps one fully 3D iPhone centered while the story changes as the user scrolls.",
    screen: "splash",
  },
  {
    side: "left",
    label: "Beat 01",
    title: "Account & Money",
    copy: "Balances, linked accounts, and savings goals stay visible on a simple dashboard.",
    screen: "account",
  },
  {
    side: "right",
    label: "Beat 02",
    title: "QR Payments",
    copy: "Share a QR or username instantly for quick payment collection.",
    screen: "qr",
  },
  {
    side: "left",
    label: "Beat 03",
    title: "Send & Receive",
    copy: "Transfers feel live with a fast, readable feed of incoming and outgoing activity.",
    screen: "transfer",
  },
  {
    side: "right",
    label: "Beat 04",
    title: "Rewards",
    copy: "Make Blink Points and tier benefits feel desirable, premium, and easy to browse.",
    screen: "rewards",
  },
  {
    side: "left",
    label: "Beat 05",
    title: "Trust & Security",
    copy: "Security gets its own moment with biometrics, fraud AI, and encryption.",
    screen: "security",
  },
  {
    side: "right",
    label: "Beat 06",
    title: "Bill Pay",
    copy: "Paid, pending, and scheduled bills are grouped into a clean utility dashboard.",
    screen: "bills",
  },
];

const STORY_SCROLL_END = 0.7;
const PHONE_FULL_ROTATION_DEG = 360;

const featureCards = [
  ["Account overview", "See savings, current balance, and linked accounts in one place."],
  ["QR pay", "Generate and share your QR for fast payments and collections."],
  ["Transfers", "Live send and receive activity stays readable at a glance."],
  ["Rewards", "Surface loyalty tiers, points, and relevant offers without clutter."],
  ["Security", "Show biometrics, fraud AI, and encryption as visible product benefits."],
  ["Bill pay", "Track paid and pending bills in a compact visual grid."],
];

const howItWorks = [
  ["01", "Download", "Install Blink from the App Store or Google Play."],
  ["02", "Verify", "Set up your profile and confirm your identity securely."],
  ["03", "Connect", "Link accounts, payment methods, and your banking profile."],
  ["04", "Use", "Send, save, pay, and manage money from one experience."],
];

export default function App() {
  return (
    <main>
      <Navigation />
      <HeroIntro />
      <BlinkScrollExperience />
      <FeaturesGrid />
      <HowItWorks />
      <TrustStrip />
      <Stats />
      <DownloadCTA />
      <Footer />
    </main>
  );
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <a href="#top" className="brand-mark" aria-label="Blink home">
        blink
      </a>
      <nav className="segment" aria-label="Audience switcher">
        <button>Personal</button>
        <button>Business</button>
      </nav>
      <a href="#download" className="nav-cta">
        Download App
      </a>
    </header>
  );
}

function HeroIntro() {
  return (
    <section id="top" className="hero-intro section-pad">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="hero-content"
      >
        <p className="kicker">
          <Sparkles size={16} /> City Bank PLC digital banking
        </p>
        <h1>blink — nothing like it.</h1>
        <p>
          A scroll-driven homepage prototype with a centered 3D latest-iPhone-style hero, sideways Y-axis rotation during the story, a marquee moment, and a trust-led parked state.
        </p>
        <div className="hero-actions">
          <a href="#download" className="primary-btn">
            Download App
          </a>
          <a href="#experience" className="secondary-btn">
            Watch the scroll
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function BlinkScrollExperience() {
  const sectionRef = useRef(null);
  const [activeBeat, setActiveBeat] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const storyProgress = Math.min(STORY_SCROLL_END, Math.max(0, latest));
    const storyT = storyProgress / STORY_SCROLL_END;
    const normalized = Math.min(beats.length - 0.001, storyT * beats.length);
    const beatIndex = Math.floor(normalized);
    const nextRotation = storyT * PHONE_FULL_ROTATION_DEG;

    setActiveBeat(beatIndex);
    setRotationDeg(nextRotation);
  });

  const marqueeX = useTransform(scrollYProgress, [0.48, 0.76], ["12%", "-48%"]);
  const bgOneY = useTransform(scrollYProgress, [0, 1], [90, -120]);
  const bgTwoY = useTransform(scrollYProgress, [0, 1], [-70, 120]);
  const bgThreeY = useTransform(scrollYProgress, [0, 1], [45, -95]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 160]);

  const phoneParkYRaw = useTransform(scrollYProgress, [0.74, 0.92], [0, 230]);
  const phoneParkScaleRaw = useTransform(scrollYProgress, [0.74, 0.92], [1, 0.78]);
  const phoneParkY = useSpring(phoneParkYRaw, { stiffness: 80, damping: 22 });
  const phoneParkScale = useSpring(phoneParkScaleRaw, { stiffness: 80, damping: 22 });
  const phoneGlow = useTransform(scrollYProgress, [0.84, 0.94], [0, 1]);
  const parkCopyOpacity = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);
  const parkCopyY = useTransform(scrollYProgress, [0.8, 0.9], [70, 0]);

  return (
    <section id="experience" ref={sectionRef} className="scroll-experience">
      <div className="experience-sticky">
        <motion.div className="orb orb-one" style={{ y: bgOneY, rotate: bgRotate }} />
        <motion.div className="orb orb-two" style={{ y: bgTwoY }} />
        <motion.div className="orb orb-three" style={{ y: bgThreeY, rotate: bgRotate }} />

        <FeatureCopy beat={beats[activeBeat]} activeBeat={activeBeat} />

        <motion.div className="marquee" style={{ x: marqueeX }}>
          <span>NEW BANKING SENSE</span>
          <span>NEW BANKING SENSE</span>
          <span>NEW BANKING SENSE</span>
        </motion.div>

        <motion.div className="park-copy park-left" style={{ opacity: parkCopyOpacity, y: parkCopyY }}>
          <BadgeCheck size={22} />
          <span>Backed by City Bank PLC and designed to build trust fast.</span>
        </motion.div>
        <motion.div className="park-copy park-right" style={{ opacity: parkCopyOpacity, y: parkCopyY }}>
          <ShieldCheck size={22} />
          <span>Security messaging stays visible without taking focus away from the phone.</span>
        </motion.div>

        <motion.div className="phone-stage" style={{ y: phoneParkY, scale: phoneParkScale }}>
          <motion.div className="landing-glow" style={{ opacity: phoneGlow }} />
          <Phone3D rotationY={(rotationDeg * Math.PI) / 180} />
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCopy({ beat, activeBeat }) {
  return (
    <div className={`feature-copy ${beat.side}`}>
      <motion.p
        key={`label-${activeBeat}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36 }}
      >
        {beat.label}
      </motion.p>
      <motion.h2
        key={`title-${activeBeat}`}
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {beat.title}
      </motion.h2>
      <motion.span
        key={`copy-${activeBeat}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
      >
        {beat.copy}
      </motion.span>
    </div>
  );
}

function FeaturesGrid() {
  return (
    <section className="section-pad features-section">
      <div className="section-heading">
        <p className="kicker">Features</p>
        <h2>Everything users need after the hero story.</h2>
      </div>
      <div className="features-grid">
        {featureCards.map(([title, copy], index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: index * 0.04 }}
          >
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section-pad how-section">
      <div className="section-heading">
        <p className="kicker">How it works</p>
        <h2>Four steps from download to daily banking.</h2>
      </div>
      <div className="steps-row">
        {howItWorks.map(([number, title, copy]) => (
          <article key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrustStrip() {
  const trust = [
    [Building2, "City Bank"],
    [BadgeCheck, "Bangladesh Bank"],
    [LockKeyhole, "Encryption"],
    [ShieldCheck, "Fraud AI"],
    [Fingerprint, "Biometrics"],
  ];

  return (
    <section className="trust-strip">
      {trust.map(([Icon, label]) => (
        <div key={label}>
          <Icon size={20} />
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}

function Stats() {
  return (
    <section className="section-pad stats-section">
      <article>
        <strong>50+</strong>
        <span>Features</span>
      </article>
      <article>
        <strong>0.3s</strong>
        <span>Transfer time</span>
      </article>
      <article>
        <strong>99.9%</strong>
        <span>Uptime</span>
      </article>
    </section>
  );
}

function DownloadCTA() {
  return (
    <section id="download" className="download-cta section-pad">
      <div>
        <p className="kicker">Download Blink</p>
        <h2>Start banking with a tap.</h2>
        <p>Use these buttons as placeholders until the real App Store and Google Play URLs are ready.</p>
      </div>
      <div className="store-buttons">
        <a href="#top">
          <Apple size={22} /> App Store <ChevronRight size={18} />
        </a>
        <a href="#top">
          <Smartphone size={22} /> Google Play <ChevronRight size={18} />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer section-pad">
      <div>
        <a className="brand-mark" href="#top">
          blink
        </a>
        <p>blink — nothing like it.</p>
      </div>
      <div>
        <h4>Personal</h4>
        <a>Accounts</a>
        <a>Cards</a>
        <a>QR Pay</a>
      </div>
      <div>
        <h4>Business</h4>
        <a>Payments</a>
        <a>Merchant QR</a>
        <a>Reports</a>
      </div>
      <div>
        <h4>Company</h4>
        <a>About</a>
        <a>Security</a>
        <a>Support</a>
      </div>
      <small>© 2026 Blink by City Bank PLC. Prototype for presentation use.</small>
    </footer>
  );
}
