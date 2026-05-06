import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Apple,
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  ChevronRight,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Phone3D from "./Phone3D.jsx";

const beats = [
  {
    side: "right",
    label: "Beat 00",
    title: "Bank with more control",
    copy: "Track, save, and stay on top of your money with a simpler digital experience.",
    screen: "rewards-overview",
  },
  {
    side: "left",
    label: "Beat 01",
    title: "Send & receive money",
    copy: "Send, receive, pay, and manage your money from one smart app.",
    screen: "send-money",
  },
  {
    side: "right",
    label: "Beat 02",
    title: "Rewards that feel valuable",
    copy: "Earn points, unlock offers, and enjoy benefits designed to reward everyday usage.",
    screen: "rewards-quests",
  },
  {
    side: "left",
    label: "Beat 03",
    title: "Blink account",
    copy: "Gain valuable insights, understand where your money is going, and make informed financial decisions.",
    screen: "rewards-overview",
  },
  {
    side: "right",
    label: "Beat 04",
    title: "Bill payments",
    copy: "Set and track your financial tools without losing control of day-to-day money moments.",
    screen: "send-money",
  },
  {
    side: "left",
    label: "Beat 05",
    title: "Loans & deposits",
    copy: "Link accounts, manage deposits, and access services with clarity from one place.",
    screen: "rewards-quests",
  },
  {
    side: "right",
    label: "Beat 06",
    title: "Secure banking",
    copy: "Bank with confidence with security, reliability, and City Bank PLC behind every step.",
    screen: "rewards-overview",
  },
];

const STORY_SCROLL_END = 0.7;
const PHONE_SIDE_ROTATION_DEG = 16;

const featureCards = [
  ["Move money with ease", "Send, receive, pay, and manage your money from one smart app."],
  ["Bank with more control", "Track, save, and stay on top of your money with a simpler digital experience."],
  ["Built for trust", "Security, reliability, and the confidence of City Bank PLC behind every step."],
  ["Scan To Pay", "Seamless payments at your fingertips - scan, pay, and go with ease."],
  ["Secure Banking", "Bank with confidence - our cutting-edge security keeps your finances safe, always."],
  ["Personalized Investing", "Invest smarter with personalized recommendations tailored to your financial goals."],
];

const howItWorks = [
  ["Step 1", "Sign Up With Blink", "Create your Blink account and unlock a world of financial possibilities."],
  ["Step 2", "Connect Your Accounts", "Link all your financial accounts effortlessly to Blink for comprehensive management."],
  ["Step 3", "Start Banking", "Take control of your finances with Blink's intuitive features and personalized tools."],
];

export default function App() {
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("site-loading", !modelReady);
    return () => document.body.classList.remove("site-loading");
  }, [modelReady]);

  return (
    <>
      <SiteLoader isVisible={!modelReady} />
      <main>
        <Navigation />
        <HeroIntro />
        <BlinkScrollExperience onModelReady={() => setModelReady(true)} />
        <FeaturesGrid />
        <HowItWorks />
        <TrustStrip />
        <Stats />
        <DownloadCTA />
        <Footer />
      </main>
    </>
  );
}

function SiteLoader({ isVisible }) {
  const { progress } = useProgress();
  const safeProgress = Number.isFinite(progress) ? progress : 0;
  const displayedProgress = isVisible ? Math.min(99, Math.max(8, Math.round(safeProgress))) : 100;

  return (
    <div className={`site-loader ${isVisible ? "" : "is-hidden"}`} aria-hidden={!isVisible}>
      <div className="site-loader-shell">
        <div className="site-loader-phone" aria-hidden="true">
          <div className="site-loader-screen">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="site-loader-copy">
          <strong>blink</strong>
          {/* <span>Loading experience</span> */}
        </div>
        <div className="site-loader-progress" aria-hidden="true">
          <i style={{ width: `${displayedProgress}%` }} />
        </div>
        <small>{displayedProgress}%</small>
      </div>
    </div>
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
        blink <small>by city bank</small>
      </a>
      <nav className="segment" aria-label="Audience switcher">
        <button>Personal</button>
        <button>Business</button>
      </nav>
      <nav className="nav-links" aria-label="Primary navigation">
        {["Account & Money", "Payments & Transfer", "Lending & Deposit", "Cards"].map((item) => (
          <a key={item} href="#features">
            {item} <ChevronDown size={12} />
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <div className="language-toggle" aria-label="Language selector">
          <button>EN</button>
          <button>বাংলা</button>
        </div>
        <a href="#download" className="nav-cta">
          Download App
        </a>
      </div>
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
        <a href="#download" className="hero-pill">
          Be first to know when Blink goes live <ArrowRight size={18} />
        </a>
        <h1>Banking, Reimagined For The Way Bangladesh Moves.</h1>
        <p>
          Blink is almost here. A new digital banking experience by City Bank PLC designed to make everyday money simpler, faster, and more intuitive.
        </p>
        <div className="hero-actions">
          <a href="#download" className="primary-btn">
            Download App
          </a>
          <a href="#experience" className="secondary-btn">
            Explore Blink
          </a>
        </div>
        <p className="hero-proof">Backed by City Bank PLC <span /> Secure by design <span /> Bangladesh Bank licensed</p>
      </motion.div>
    </section>
  );
}

function BlinkScrollExperience({ onModelReady }) {
  const sectionRef = useRef(null);
  const [activeBeat, setActiveBeat] = useState(0);
  const [pageMetrics, setPageMetrics] = useState({
    width: 1440,
    height: 900,
    experienceTop: 900,
  });

  const { scrollY } = useScroll();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const updatePageMetrics = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      setPageMetrics({
        width: window.innerWidth,
        height: window.innerHeight,
        experienceTop: rect.top + window.scrollY,
      });
    };

    updatePageMetrics();
    window.addEventListener("resize", updatePageMetrics);
    window.addEventListener("load", updatePageMetrics);
    return () => {
      window.removeEventListener("resize", updatePageMetrics);
      window.removeEventListener("load", updatePageMetrics);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const storyProgress = Math.min(STORY_SCROLL_END, Math.max(0, latest));
    const storyT = storyProgress / STORY_SCROLL_END;
    const normalized = Math.min(beats.length - 0.001, storyT * beats.length);
    const beatIndex = Math.floor(normalized);

    setActiveBeat(beatIndex);
  });

  const marqueeX = useTransform(scrollYProgress, [0.48, 0.76], ["12%", "-48%"]);
  const bgOneY = useTransform(scrollYProgress, [0, 1], [90, -120]);
  const bgTwoY = useTransform(scrollYProgress, [0, 1], [-70, 120]);
  const bgThreeY = useTransform(scrollYProgress, [0, 1], [45, -95]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 160]);

  const phoneParkYRaw = useTransform(scrollYProgress, [0.72, 0.96], [0, 230]);
  const phoneParkScaleRaw = useTransform(scrollYProgress, [0.72, 0.96], [1, 0.78]);
  const phoneParkY = useSpring(phoneParkYRaw, { stiffness: 42, damping: 30 });
  const phoneParkScale = useSpring(phoneParkScaleRaw, { stiffness: 42, damping: 30 });
  const phoneGlow = useTransform(scrollYProgress, [0.84, 0.94], [0, 1]);
  const parkCopyOpacity = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);
  const parkCopyY = useTransform(scrollYProgress, [0.8, 0.9], [70, 0]);
  const heroOffsetX = pageMetrics.width >= 980 ? pageMetrics.width * 0.26 : 0;
  const heroOffsetY = pageMetrics.width >= 980 ? pageMetrics.height * 0.04 : pageMetrics.height * 0.16;
  const heroScale = pageMetrics.width >= 980 ? 1.40 : 0.76;
  const heroTransitionStart = Math.max(1, pageMetrics.experienceTop * 0.38);
  const heroTransitionEnd = Math.max(heroTransitionStart + 1, pageMetrics.experienceTop);
  const phoneHeroX = useTransform(
    scrollY,
    [0, heroTransitionStart, heroTransitionEnd],
    [heroOffsetX, heroOffsetX, 0]
  );
  const phoneHeroY = useTransform(
    scrollY,
    [0, heroTransitionStart, heroTransitionEnd],
    [heroOffsetY, heroOffsetY, 0]
  );
  const phoneHeroScale = useTransform(
    scrollY,
    [0, heroTransitionStart, heroTransitionEnd],
    [heroScale, heroScale, 1]
  );
  const phoneLayerY = useTransform([phoneHeroY, phoneParkY], ([heroY, parkY]) => heroY + parkY);
  const phoneLayerScale = useTransform(
    [phoneHeroScale, phoneParkScale],
    ([baseScale, parkScale]) => baseScale * parkScale
  );
  const heroPhoneOpacity = pageMetrics.width >= 760 ? 1 : 0;
  const phoneIntroOpacity = useTransform(
    scrollY,
    [0, heroTransitionStart, heroTransitionEnd],
    [heroPhoneOpacity, heroPhoneOpacity, 1]
  );
  const phoneExperienceOpacity = useTransform(scrollYProgress, [0, 0.97, 1], [1, 1, 0]);
  const phoneLayerOpacity = useTransform(
    [phoneIntroOpacity, phoneExperienceOpacity],
    ([introOpacity, experienceOpacity]) => introOpacity * experienceOpacity
  );
  const activeBeatConfig = beats[activeBeat];
  const phoneSideDirection = activeBeatConfig.side === "right" ? 1 : -1;
  const phoneRotationY = phoneSideDirection * (PHONE_SIDE_ROTATION_DEG * Math.PI) / 180;
  const phoneSlantZ = phoneSideDirection * 0.12;

  return (
    <section id="experience" ref={sectionRef} className="scroll-experience">
      <motion.div
        className="shared-phone-stage"
        style={{ x: phoneHeroX, y: phoneLayerY, scale: phoneLayerScale, opacity: phoneLayerOpacity }}
        aria-hidden="true"
      >
        <div className="shared-phone-anchor">
          <motion.div className="landing-glow" style={{ opacity: phoneGlow }} />
          <Phone3D
            rotationY={phoneRotationY}
            slantZ={phoneSlantZ}
            screenIntroT={1}
            screen={activeBeatConfig.screen}
            onReady={onModelReady}
          />
        </div>
      </motion.div>

      <div className="experience-sticky">
        <motion.div className="orb orb-one" style={{ y: bgOneY, rotate: bgRotate }} />
        <motion.div className="orb orb-two" style={{ y: bgTwoY }} />
        <motion.div className="orb orb-three" style={{ y: bgThreeY, rotate: bgRotate }} />

        <FeatureCopy beat={activeBeatConfig} activeBeat={activeBeat} />

        <motion.div className="marquee" style={{ x: marqueeX }}>
          <span>NEW BANKING SENSE</span>
          <span>NEW BANKING SENSE</span>
          <span>NEW BANKING SENSE</span>
        </motion.div>

        <motion.div className="park-copy park-left" style={{ opacity: parkCopyOpacity, y: parkCopyY }}>
          <BadgeCheck size={22} />
          <span>Built around safe access, protection, and customer reassurance.</span>
        </motion.div>
        <motion.div className="park-copy park-right" style={{ opacity: parkCopyOpacity, y: parkCopyY }}>
          <ShieldCheck size={22} />
          <span>Backed by City Bank PLC with established banking confidence.</span>
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
    <section id="features" className="section-pad features-section">
      <div className="section-heading">
        <p className="kicker">Features</p>
        <h2>What Blink Will <em>Unlock</em></h2>
        <p>Unlock convenience and efficiency with standout features, revolutionizing your banking journey.</p>
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
        <p className="kicker">Get started</p>
        <h2>Get Started In Just 3 Simple Steps.</h2>
        <p>Three simple steps to unlock the power of Blink and revolutionize your banking experience.</p>
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
    [Building2, "Made For Bangladesh"],
    [BadgeCheck, "Backed By City Bank Plc."],
    [LockKeyhole, "Secure Banking"],
    [ShieldCheck, "Designed With Security In Mind"],
    [Fingerprint, "Personalized Investing"],
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
  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true, margin: "-120px" });

  return (
    <section ref={statsRef} className="section-pad stats-section">
      <CountUpStat start={isInView} value={50} suffix="+" label="Partner companies around the globe" />
      <CountUpStat start={isInView} value={125500} suffix="" label="Blink reward points experience" />
      <CountUpStat start={isInView} value={3} suffix="" label="Simple steps to start banking" />
    </section>
  );
}

function CountUpStat({ start, value, decimals = 0, suffix = "", label }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start) return undefined;

    let animationFrame;
    const duration = 1600;
    const startedAt = performance.now();

    const animate = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(value * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      setDisplayValue(value);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [start, value]);

  return (
    <article>
      <strong>
        {displayValue.toFixed(decimals)}
        {suffix}
      </strong>
      <span>{label}</span>
    </article>
  );
}

function DownloadCTA() {
  return (
    <section id="download" className="download-cta section-pad">
      <div>
        <p className="kicker">Download Blink</p>
        <h2>One app for your everyday money moments.</h2>
        <p>Pay bills, transfer funds, recharge mobile, cash out, and stay in control of your day-to-day finances.</p>
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
          blink <small>by city bank</small>
        </a>
        <p>Banking, reimagined for the way Bangladesh moves.</p>
      </div>
      <div>
        <h4>Personal</h4>
        <a>Account & Money</a>
        <a>Payments & Transfer</a>
        <a>Cards</a>
      </div>
      <div>
        <h4>Business</h4>
        <a>Business Services</a>
        <a>Banking Support</a>
        <a>Rewards</a>
      </div>
      <div>
        <h4>Company</h4>
        <a>Made For Bangladesh</a>
        <a>Secure Banking</a>
        <a>Support</a>
      </div>
      <small>© 2026 Blink by City Bank PLC. Prototype for presentation use.</small>
    </footer>
  );
}
