import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bounds,
  Center,
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/source/iphone_17_4.glb";

// If the imported GLB is ever sideways, change this to something like:
// [Math.PI / 2, 0, 0] or [0, Math.PI, 0]
const MODEL_BASE_ROTATION = [0, 0, 0];
const MODEL_Z_SLANT_LEFT = -0.12;
const SCREEN_PLANE_SIZE = [1.9, 4.0];
const SCREEN_PLANE_POSITION = [0, 0.0014, 0.152];
const SCREEN_TEXTURE_WIDTH = 720;
const SCREEN_TEXTURE_HEIGHT = 1504;

export default function Phone3D({
  rotationY = 0,
  slantZ = MODEL_Z_SLANT_LEFT,
  screenIntroT = 0,
  screen = "rewards-overview",
  onReady,
}) {
  return (
    <div className="phone-canvas-shell" aria-label="3D iPhone model">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 28 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={1.45} />
        <directionalLight position={[4, 6, 6]} intensity={3.2} castShadow />
        <directionalLight position={[-4, 2, 4]} intensity={1.5} />
        <pointLight position={[0, 2, 5]} intensity={10} />

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.16}>
            <Center>
              <RotatingPhone
                rotationY={rotationY}
                slantZ={slantZ}
                screenIntroT={screenIntroT}
                screen={screen}
                onReady={onReady}
              />
            </Center>
          </Bounds>

          <Environment preset="city" />
          <ContactShadows
            position={[0, -2.8, 0]}
            opacity={0.34}
            scale={8}
            blur={2.6}
            far={6}
          />
        </Suspense>

        <OrbitControls enabled={false} />
      </Canvas>
    </div>
  );
}

function RotatingPhone({ rotationY, slantZ, screenIntroT, screen, onReady }) {
  const rotatingGroupRef = useRef(null);
  const screenSwitchProgressRef = useRef(1);
  const { scene } = useGLTF(MODEL_PATH);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      if (!child.material) return;

      const materials = Array.isArray(child.material)
        ? child.material.map((material) => material.clone())
        : child.material.clone();

      child.material = materials;

      const materialList = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materialList.forEach((material) => {
        material.side = THREE.DoubleSide;
        material.needsUpdate = true;
      });
    });

    const readyFrame = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(readyFrame);
  }, [clonedScene, onReady]);

  useEffect(() => {
    screenSwitchProgressRef.current = 0;
  }, [screen]);

  useFrame((_, delta) => {
    if (!rotatingGroupRef.current) return;

    screenSwitchProgressRef.current = Math.min(1, screenSwitchProgressRef.current + delta * 1.85);
    const switchT = easeOutCubic(screenSwitchProgressRef.current);
    const pulse = Math.sin(switchT * Math.PI);
    const targetScale = 1 + pulse * 0.025;
    const targetLift = pulse * 0.085;

    rotatingGroupRef.current.rotation.y = THREE.MathUtils.damp(
      rotatingGroupRef.current.rotation.y,
      rotationY,
      3.2,
      delta
    );
    rotatingGroupRef.current.rotation.z = THREE.MathUtils.damp(
      rotatingGroupRef.current.rotation.z,
      slantZ,
      3.4,
      delta
    );
    rotatingGroupRef.current.rotation.x = THREE.MathUtils.damp(
      rotatingGroupRef.current.rotation.x,
      -pulse * 0.035,
      4.2,
      delta
    );
    rotatingGroupRef.current.position.y = THREE.MathUtils.damp(
      rotatingGroupRef.current.position.y,
      targetLift,
      5.2,
      delta
    );
    rotatingGroupRef.current.scale.setScalar(
      THREE.MathUtils.damp(rotatingGroupRef.current.scale.x, targetScale, 5.2, delta)
    );
  });

  return (
    <group rotation={MODEL_BASE_ROTATION}>
      <group ref={rotatingGroupRef} rotation={[0, 0, slantZ]}>
        <primitive object={clonedScene} />
        <HeroScreenPlane progress={screenIntroT} screen={screen} />
      </group>
    </group>
  );
}

function HeroScreenPlane({ progress, screen }) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);
  const textureState = useMemo(() => createAppScreenTexture(screen), []);
  const screenTransitionRef = useRef({ from: screen, to: screen, progress: 1 });
  const currentScreenRef = useRef(screen);

  useEffect(() => {
    if (screen === currentScreenRef.current) return;

    screenTransitionRef.current = {
      from: currentScreenRef.current,
      to: screen,
      progress: 0,
    };
    currentScreenRef.current = screen;
  }, [screen]);

  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    const targetProgress = THREE.MathUtils.clamp(progress, 0, 1);
    const transition = screenTransitionRef.current;
    transition.progress = Math.min(1, transition.progress + delta * 2.1);
    drawScreenTransition(textureState, transition.from, transition.to, transition.progress);
    textureState.texture.needsUpdate = true;

    meshRef.current.scale.x = THREE.MathUtils.damp(meshRef.current.scale.x, 1, 14, delta);
    meshRef.current.scale.y = THREE.MathUtils.damp(meshRef.current.scale.y, 1, 14, delta);
    meshRef.current.position.y = THREE.MathUtils.damp(
      meshRef.current.position.y,
      SCREEN_PLANE_POSITION[1],
      14,
      delta
    );
    materialRef.current.opacity = THREE.MathUtils.damp(
      materialRef.current.opacity,
      targetProgress,
      14,
      delta
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={SCREEN_PLANE_POSITION}
      renderOrder={20}
      scale={[1, 1, 1]}
    >
      <planeGeometry args={SCREEN_PLANE_SIZE} />
      <meshBasicMaterial
        ref={materialRef}
        map={textureState.texture}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function createAppScreenTexture(initialScreen) {
  const canvas = document.createElement("canvas");
  canvas.width = SCREEN_TEXTURE_WIDTH;
  canvas.height = SCREEN_TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d");
  const textureState = { canvas, ctx, texture: null };
  const texture = new THREE.CanvasTexture(canvas);

  drawScreenTransition(textureState, initialScreen, initialScreen, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  textureState.texture = texture;
  return textureState;
}

function drawScreenTransition(textureState, fromScreen, toScreen, progress) {
  const { canvas, ctx } = textureState;
  const eased = easeOutCubic(THREE.MathUtils.clamp(progress, 0, 1));
  const travel = canvas.height * 0.2;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  roundedRect(ctx, 0, 0, canvas.width, canvas.height, 92);
  ctx.clip();
  ctx.fillStyle = "#f4f6f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (fromScreen === toScreen || eased >= 1) {
    drawAppScreen(ctx, toScreen, 0, 1);
  } else {
    drawAppScreen(ctx, fromScreen, -travel * eased, 1 - eased * 0.75);
    drawAppScreen(ctx, toScreen, travel * (1 - eased), Math.min(1, eased + 0.1));
    drawTransitionLight(ctx, eased);
  }

  ctx.restore();
}

function drawAppScreen(ctx, screen, offsetY, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(0, offsetY);

  if (screen === "send-money") {
    drawSendMoneyScreen(ctx);
  } else if (screen === "rewards-quests") {
    drawRewardsQuestScreen(ctx);
  } else {
    drawRewardsOverviewScreen(ctx);
  }

  ctx.restore();
}

function drawRewardsOverviewScreen(ctx) {
  drawMintBackground(ctx);
  drawStatusBar(ctx, "#596272");
  drawTopProfile(ctx);
  drawText(ctx, "Rewards", 34, 266, 700, 42, "#1d2430");
  drawText(ctx, "125,500", 205, 405, 900, 88, "#202631");
  drawPill(ctx, 518, 307, 100, 48, "#dcecff", "#80bfff");
  drawText(ctx, "⚡ 2X", 543, 339, 800, 24, "#1762d0");
  drawText(ctx, "━━", 645, 348, 700, 42, "rgba(255,255,255,0.82)");
  drawPill(ctx, 110, 472, 270, 70, "#42d360");
  drawText(ctx, "View coin details", 145, 516, 800, 26, "#ffffff");
  drawPill(ctx, 420, 472, 185, 70, "#e4f8d2");
  drawText(ctx, "Tier: Gold", 461, 516, 800, 26, "#273422");

  drawSheet(ctx, 0, 595);
  drawSectionTitle(ctx, "My voucher", 34, 672);
  drawViewAll(ctx, 536, 672);
  drawVoucherCard(ctx, 34, 724);
  drawVoucherCard(ctx, 365, 724);

  drawSectionTitle(ctx, "Quests", 34, 958);
  drawViewAll(ctx, 536, 958);
  drawFilterPill(ctx, 36, 1011, "▦  Weekly", true);
  drawFilterPill(ctx, 246, 1011, "✤  Seasonal", false);
  drawFilterPill(ctx, 465, 1011, "♙  Savings", false);
  drawQuestSmall(ctx, 34, 1115, "7 days login streak", "▦");
  drawQuestSmall(ctx, 365, 1115, "Send money ৳2000", "♣");
  drawBottomNav(ctx, "Reward");
}

function drawRewardsQuestScreen(ctx) {
  drawMintBackground(ctx);
  drawStatusBar(ctx, "#596272");
  drawTopProfile(ctx);
  drawText(ctx, "Rewards", 34, 250, 700, 42, "#1d2430");
  drawPill(ctx, 34, 300, 270, 70, "#42d360");
  drawText(ctx, "View coin details", 70, 344, 800, 26, "#ffffff");
  drawPill(ctx, 315, 300, 285, 70, "#e4f8d2");
  drawText(ctx, "Tier: Gold", 405, 344, 800, 26, "#273422");

  drawSheet(ctx, 0, 390);
  drawSectionTitle(ctx, "Quests", 34, 465);
  drawViewAll(ctx, 536, 465);
  drawFilterPill(ctx, 36, 515, "▦  Weekly", true);
  drawFilterPill(ctx, 246, 515, "✤  Seasonal", false);
  drawFilterPill(ctx, 465, 515, "♙  Savings", false);
  drawFilterPill(ctx, 655, 515, "+", false);
  drawQuestLarge(ctx, 34, 640, "Add money ৳1,000", "3d 15h 34m left");
  drawQuestLarge(ctx, 440, 640, "Add money", "3d 15h 34m left");
  drawMegaQuest(ctx, 34, 1074);
  drawBottomNav(ctx, "Reward");
}

function drawSendMoneyScreen(ctx) {
  ctx.fillStyle = "#f2f3f5";
  ctx.fillRect(0, 0, SCREEN_TEXTURE_WIDTH, SCREEN_TEXTURE_HEIGHT);
  drawStatusBar(ctx, "#5a6473");
  drawActionBubble(ctx, 588, 154, 42);
  drawText(ctx, "‹", 50, 221, 400, 62, "#67707d");
  drawText(ctx, "Send money", 34, 296, 800, 42, "#252a33");
  drawLine(ctx, 0, 326, 720, 326, "rgba(0,0,0,0.06)");

  drawText(ctx, "To", 34, 396, 500, 26, "#69727f");
  drawText(ctx, "Moontakim Da Silva", 34, 447, 500, 32, "#2b313b");
  drawText(ctx, "+94112345678", 34, 495, 500, 26, "#98a1ad");
  drawAvatar(ctx, 666, 447, 34);

  drawSheet(ctx, 0, 535);
  drawText(ctx, "From", 34, 605, 500, 26, "#69727f");
  drawAvatar(ctx, 77, 665, 36);
  drawText(ctx, "My blink", 136, 657, 700, 32, "#252b34");
  drawText(ctx, "Balance: ৳5,000.00", 136, 705, 500, 26, "#29a847");
  drawPill(ctx, 553, 627, 130, 72, "#e4e8ee");
  drawText(ctx, "Change", 584, 672, 800, 24, "#2b3038");

  drawCard(ctx, 34, 762, 652, 160, 24);
  drawText(ctx, "৳ 0", 320, 837, 900, 48, "#1f2630", "center");
  drawText(ctx, "Enter amount", 360, 887, 500, 26, "#6b7480", "center");
  drawText(ctx, "Min ৳50", 34, 965, 500, 22, "#68717d");
  drawText(ctx, "Max ৳50,000", 560, 965, 500, 22, "#68717d");

  drawAmountChip(ctx, 34, 990, "৳500");
  drawAmountChip(ctx, 216, 990, "৳1,000");
  drawAmountChip(ctx, 389, 990, "৳2,000");
  drawAmountChip(ctx, 562, 990, "৳5,000");
  drawText(ctx, "✽  Apply promo/discount", 178, 1116, 700, 30, "#1c8f34");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 1330, 720, 174);
  drawLine(ctx, 0, 1330, 720, 1330, "rgba(0,0,0,0.08)");
  drawPill(ctx, 45, 1374, 650, 106, "#49d25b");
  drawText(ctx, "Review", 360, 1438, 800, 34, "#ffffff", "center");
  drawLine(ctx, 280, 1490, 440, 1490, "#15191f", 8);
}

function drawGlow(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawMintBackground(ctx) {
  const background = ctx.createLinearGradient(0, 0, 0, SCREEN_TEXTURE_HEIGHT);
  background.addColorStop(0, "#a8e8e5");
  background.addColorStop(0.38, "#c9f4d8");
  background.addColorStop(1, "#f4f6f5");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, SCREEN_TEXTURE_WIDTH, SCREEN_TEXTURE_HEIGHT);
}

function drawStatusBar(ctx, color) {
  drawText(ctx, "9:30", 34, 72, 600, 26, color);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(598, 58);
  ctx.lineTo(616, 42);
  ctx.lineTo(634, 58);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(648, 45, 18, 28);
  ctx.fillRect(673, 37, 14, 36);
}

function drawTopProfile(ctx) {
  drawAvatar(ctx, 76, 158, 38);
  drawActionBubble(ctx, 562, 160, 42);
  drawText(ctx, "☰", 662, 178, 600, 36, "#26313b", "center");
}

function drawActionBubble(ctx, x, y, radius) {
  ctx.save();
  ctx.shadowColor = "rgba(22, 153, 49, 0.35)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#46d44f";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawText(ctx, "◰", x, y + 9, 800, 35, "#ffffff", "center");
}

function drawAvatar(ctx, x, y, radius) {
  ctx.save();
  ctx.fillStyle = "#31c66b";
  ctx.beginPath();
  ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e7b082";
  ctx.beginPath();
  ctx.arc(x, y - 4, radius * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#253647";
  ctx.beginPath();
  ctx.arc(x, y - 19, radius * 0.5, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e9f7ff";
  roundedRect(ctx, x - radius * 0.62, y + 12, radius * 1.24, radius * 0.8, 14);
  ctx.fill();
  ctx.restore();
}

function drawSheet(ctx, x, y) {
  ctx.fillStyle = "#f5f6f8";
  roundedRect(ctx, x, y, SCREEN_TEXTURE_WIDTH, SCREEN_TEXTURE_HEIGHT - y + 120, 42);
  ctx.fill();
}

function drawVoucherCard(ctx, x, y) {
  drawCard(ctx, x, y, 305, 188, 22);
  drawPill(ctx, x + 183, y - 3, 115, 38, "#fff7dc", "#ffc235");
  drawText(ctx, "+200 🪙", x + 240, y + 24, 500, 20, "#7c5b00", "center");
  drawPill(ctx, x + 24, y + 31, 46, 46, "#47d35b");
  drawText(ctx, "↗", x + 47, y + 63, 900, 25, "#ffffff", "center");
  drawText(ctx, "10% discount", x + 24, y + 116, 600, 25, "#232a34");
  drawText(ctx, "voucher appereal", x + 24, y + 151, 400, 24, "#232a34");
}

function drawQuestSmall(ctx, x, y, title, icon) {
  drawCard(ctx, x, y, 305, 188, 22);
  drawText(ctx, icon, x + 34, y + 47, 800, 34, "#4c5968");
  drawText(ctx, title, x + 24, y + 91, 500, 25, "#252d37");
  drawProgress(ctx, x + 24, y + 151, 204, 12, 0.52);
}

function drawQuestLarge(ctx, x, y, title, time) {
  drawCard(ctx, x, y, 380, 390, 22);
  drawPill(ctx, x + 250, y - 9, 125, 42, "#fff1c4", "#ffc239");
  drawText(ctx, "🪙 2000", x + 310, y + 18, 800, 24, "#996600", "center");
  drawText(ctx, "♕", x + 24, y + 61, 800, 34, "#667180");
  drawText(ctx, title, x + 24, y + 116, 800, 30, "#2a3039");
  drawText(ctx, "Lorem ipsum dolor sit amet", x + 24, y + 166, 400, 21, "#667180");
  drawText(ctx, time, x + 24, y + 211, 700, 20, "#d88a00");
  drawText(ctx, "Progress (0%)", x + 24, y + 288, 500, 18, "#333b46");
  drawText(ctx, "৳0 / ৳1000", x + 276, y + 288, 500, 18, "#333b46");
  drawProgress(ctx, x + 24, y + 305, 332, 10, 0.02);
  drawPill(ctx, x + 24, y + 344, 332, 58, "#49d25b");
  drawText(ctx, "Start", x + 190, y + 381, 800, 24, "#ffffff", "center");
}

function drawMegaQuest(ctx, x, y) {
  drawCard(ctx, x, y, 580, 360, 24);
  drawPill(ctx, x + 20, y + 20, 135, 43, "#e7ffe5", "#70d96c");
  drawText(ctx, "Mega quest", x + 88, y + 47, 600, 20, "#388b3a", "center");
  drawPill(ctx, x + 455, y + 6, 115, 42, "#fff1c4", "#ffc239");
  drawText(ctx, "🪙 2000", x + 511, y + 33, 800, 24, "#996600", "center");
  drawText(ctx, "♕", x + 25, y + 117, 800, 35, "#667180");
  drawText(ctx, "The savings sprint", x + 25, y + 171, 800, 32, "#2a3039");
  drawText(ctx, "Save ৳500 this month to earn 1,000 bonus points.", x + 25, y + 219, 400, 21, "#667180");
  drawText(ctx, "3d 15h 34m", x + 25, y + 264, 700, 20, "#d88a00");
  drawText(ctx, "Progress (0%)", x + 25, y + 309, 500, 18, "#333b46");
  drawText(ctx, "৳0 / ৳1000", x + 442, y + 309, 500, 18, "#333b46");
  drawProgress(ctx, x + 25, y + 327, 530, 11, 0.03);
}

function drawBottomNav(ctx, active) {
  ctx.save();
  ctx.shadowColor = "rgba(22, 24, 30, 0.18)";
  ctx.shadowBlur = 26;
  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, 34, 1310, 610, 145, 44);
  ctx.fill();
  ctx.restore();
  const items = [
    ["⌂", "Home", 128],
    ["✉", "Inbox", 288],
    ["♕", "Reward", 448],
    ["▣", "QR", 588],
  ];
  items.forEach(([icon, label, x]) => {
    const isActive = label === active;
    if (isActive) {
      drawPill(ctx, x - 80, 1325, 160, 92, "#f4f7f5");
    }
    drawText(ctx, icon, x, 1361, 800, 32, isActive ? "#45d34f" : "#8a96a4", "center");
    drawText(ctx, label, x, 1399, 600, 20, isActive ? "#45d34f" : "#8a96a4", "center");
  });
  drawActionBubble(ctx, 624, 1342, 58);
  drawText(ctx, "▦", 624, 1360, 900, 46, "#ffffff", "center");
}

function drawSectionTitle(ctx, title, x, y) {
  drawText(ctx, title, x, y, 500, 30, "#222a34");
}

function drawViewAll(ctx, x, y) {
  drawText(ctx, "View all  ›", x, y, 700, 25, "#128f34");
}

function drawFilterPill(ctx, x, y, label, active) {
  const width = label === "+" ? 60 : label.length * 14 + 68;
  drawPill(ctx, x, y, width, 64, active ? "#ddffd9" : "#ffffff", active ? "#4ed65a" : "#d8dfe7");
  drawText(ctx, label, x + width / 2, y + 40, 500, 22, active ? "#249d32" : "#3f4855", "center");
}

function drawAmountChip(ctx, x, y, label) {
  drawPill(ctx, x, y, 142, 66, "#ffffff", "#d7dde6");
  drawText(ctx, label, x + 71, y + 42, 500, 25, "#4d5663", "center");
}

function drawProgress(ctx, x, y, width, height, value) {
  ctx.fillStyle = "#d9efce";
  roundedRect(ctx, x, y, width, height, height / 2);
  ctx.fill();
  ctx.fillStyle = "#42d85c";
  roundedRect(ctx, x, y, width * value, height, height / 2);
  ctx.fill();
}

function drawCard(ctx, x, y, width, height, radius = 22) {
  ctx.save();
  ctx.shadowColor = "rgba(36, 45, 60, 0.12)";
  ctx.shadowBlur = 13;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "rgba(30, 40, 55, 0.05)";
  ctx.lineWidth = 1.5;
  roundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();
}

function drawPill(ctx, x, y, width, height, fill, stroke) {
  ctx.fillStyle = fill;
  roundedRect(ctx, x, y, width, height, height / 2);
  ctx.fill();
  if (!stroke) return;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  roundedRect(ctx, x, y, width, height, height / 2);
  ctx.stroke();
}

function drawLine(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawText(ctx, text, x, y, weight, size, color, align = "left") {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
}

function drawTransitionLight(ctx, progress) {
  const y = SCREEN_TEXTURE_HEIGHT * progress;
  const light = ctx.createLinearGradient(0, y - 140, 0, y + 140);
  light.addColorStop(0, "rgba(73, 210, 91, 0)");
  light.addColorStop(0.5, "rgba(73, 210, 91, 0.32)");
  light.addColorStop(1, "rgba(73, 210, 91, 0)");
  ctx.fillStyle = light;
  ctx.fillRect(0, y - 140, SCREEN_TEXTURE_WIDTH, 280);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

useGLTF.preload(MODEL_PATH);
