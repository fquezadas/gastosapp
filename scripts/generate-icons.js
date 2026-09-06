import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Full App Icon SVG (with background, squircle/circle friendly)
const fullIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
    
    <linearGradient id="antBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <linearGradient id="antHeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>

    <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <linearGradient id="coinRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
    </filter>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#34d399" flood-opacity="0.6"/>
    </filter>

    <filter id="coinGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#fbbf24" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Layer -->
  <rect width="512" height="512" fill="url(#bgGrad)" />

  <!-- Decorative subtle background tech rings/glow -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#10b981" stroke-width="2" stroke-opacity="0.15" />
  <circle cx="256" cy="256" r="160" fill="none" stroke="#34d399" stroke-width="1.5" stroke-opacity="0.2" stroke-dasharray="8 6" />

  <!-- Main Ant Mascot & Coin Group -->
  <g filter="url(#shadow)">
    <!-- Ant Body: Abdomen (Back) -->
    <ellipse cx="180" cy="330" rx="55" ry="42" fill="url(#antBodyGrad)" transform="rotate(-15 180 330)" />
    <!-- Abdomen stripe accents -->
    <path d="M 160 298 Q 185 330 165 362" stroke="#047857" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.4"/>
    <path d="M 190 295 Q 215 328 195 360" stroke="#047857" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.4"/>

    <!-- Ant Back Legs -->
    <path d="M 160 350 Q 130 385 110 410" stroke="#10b981" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M 190 355 Q 170 395 160 425" stroke="#10b981" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M 230 350 Q 225 395 230 430" stroke="#10b981" stroke-width="8" stroke-linecap="round" fill="none"/>

    <!-- Ant Thorax (Middle Body) -->
    <ellipse cx="235" cy="305" rx="36" ry="30" fill="url(#antBodyGrad)" />

    <!-- Big Shiny Golden Dollar Coin (Centerpiece) -->
    <g filter="url(#coinGlow)">
      <!-- Coin Base -->
      <circle cx="310" cy="285" r="95" fill="url(#coinGrad)" stroke="url(#coinRim)" stroke-width="6" />
      <!-- Inner dashed coin rim -->
      <circle cx="310" cy="285" r="82" fill="none" stroke="#fef08a" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.8" />
      <!-- Embossed Dollar Sign '$' -->
      <text x="310" y="325" font-family="'Plus Jakarta Sans', 'Arial Black', sans-serif" font-size="115" font-weight="900" text-anchor="middle" fill="#78350f" opacity="0.3">
        $
      </text>
      <text x="308" y="322" font-family="'Plus Jakarta Sans', 'Arial Black', sans-serif" font-size="115" font-weight="900" text-anchor="middle" fill="#ffffff" filter="url(#glow)">
        $
      </text>
      <!-- Coin highlight reflection -->
      <path d="M 250 240 Q 310 200 370 240 A 95 95 0 0 0 250 240 Z" fill="#ffffff" opacity="0.25" />
    </g>

    <!-- Ant Head -->
    <ellipse cx="260" cy="195" rx="46" ry="42" fill="url(#antHeadGrad)" />

    <!-- Cute Eyes -->
    <!-- Left Eye -->
    <ellipse cx="245" cy="188" rx="13" ry="16" fill="#0f172a" />
    <circle cx="242" cy="182" r="5" fill="#ffffff" />
    <circle cx="248" cy="193" r="2" fill="#ffffff" />

    <!-- Right Eye -->
    <ellipse cx="275" cy="190" rx="13" ry="16" fill="#0f172a" />
    <circle cx="272" cy="184" r="5" fill="#ffffff" />
    <circle cx="278" cy="195" r="2" fill="#ffffff" />

    <!-- Friendly Smile -->
    <path d="M 252 215 Q 262 225 272 215" stroke="#064e3b" stroke-width="4" stroke-linecap="round" fill="none" />
    <!-- Cute Blush cheeks -->
    <ellipse cx="236" cy="204" rx="7" ry="4" fill="#f43f5e" opacity="0.5" />
    <ellipse cx="284" cy="206" rx="7" ry="4" fill="#f43f5e" opacity="0.5" />

    <!-- Ant Antennae (with glowing tips) -->
    <!-- Left Antenna -->
    <path d="M 240 160 Q 215 110 185 105" stroke="#34d399" stroke-width="6" stroke-linecap="round" fill="none" />
    <circle cx="185" cy="105" r="10" fill="#6ee7b7" filter="url(#glow)" />

    <!-- Right Antenna -->
    <path d="M 270 160 Q 285 105 320 95" stroke="#34d399" stroke-width="6" stroke-linecap="round" fill="none" />
    <circle cx="320" cy="95" r="10" fill="#6ee7b7" filter="url(#glow)" />

    <!-- Ant Front Arms holding the coin lovingly -->
    <path d="M 245 285 Q 265 295 280 290" stroke="#34d399" stroke-width="10" stroke-linecap="round" fill="none" />
    <circle cx="280" cy="290" r="7" fill="#6ee7b7" />
    
    <path d="M 260 315 Q 285 340 310 330" stroke="#34d399" stroke-width="10" stroke-linecap="round" fill="none" />
    <circle cx="310" cy="330" r="7" fill="#6ee7b7" />
  </g>
</svg>
`;

// 2. Foreground for Adaptive Icon (Transparent background, centered in safe zone)
const foregroundIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="antBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <linearGradient id="antHeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>

    <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <linearGradient id="coinRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/>
    </filter>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#34d399" flood-opacity="0.6"/>
    </filter>

    <filter id="coinGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#fbbf24" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Scale and center slightly for Android Adaptive Icon safe zone (middle 66%) -->
  <g transform="translate(45, 45) scale(0.82)">
    <g filter="url(#shadow)">
      <!-- Ant Body: Abdomen (Back) -->
      <ellipse cx="180" cy="330" rx="55" ry="42" fill="url(#antBodyGrad)" transform="rotate(-15 180 330)" />
      <!-- Abdomen stripe accents -->
      <path d="M 160 298 Q 185 330 165 362" stroke="#047857" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.4"/>
      <path d="M 190 295 Q 215 328 195 360" stroke="#047857" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.4"/>

      <!-- Ant Back Legs -->
      <path d="M 160 350 Q 130 385 110 410" stroke="#10b981" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M 190 355 Q 170 395 160 425" stroke="#10b981" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M 230 350 Q 225 395 230 430" stroke="#10b981" stroke-width="8" stroke-linecap="round" fill="none"/>

      <!-- Ant Thorax (Middle Body) -->
      <ellipse cx="235" cy="305" rx="36" ry="30" fill="url(#antBodyGrad)" />

      <!-- Big Shiny Golden Dollar Coin (Centerpiece) -->
      <g filter="url(#coinGlow)">
        <!-- Coin Base -->
        <circle cx="310" cy="285" r="95" fill="url(#coinGrad)" stroke="url(#coinRim)" stroke-width="6" />
        <!-- Inner dashed coin rim -->
        <circle cx="310" cy="285" r="82" fill="none" stroke="#fef08a" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.8" />
        <!-- Embossed Dollar Sign '$' -->
        <text x="310" y="325" font-family="'Plus Jakarta Sans', 'Arial Black', sans-serif" font-size="115" font-weight="900" text-anchor="middle" fill="#78350f" opacity="0.3">
          $
        </text>
        <text x="308" y="322" font-family="'Plus Jakarta Sans', 'Arial Black', sans-serif" font-size="115" font-weight="900" text-anchor="middle" fill="#ffffff" filter="url(#glow)">
          $
        </text>
        <!-- Coin highlight reflection -->
        <path d="M 250 240 Q 310 200 370 240 A 95 95 0 0 0 250 240 Z" fill="#ffffff" opacity="0.25" />
      </g>

      <!-- Ant Head -->
      <ellipse cx="260" cy="195" rx="46" ry="42" fill="url(#antHeadGrad)" />

      <!-- Cute Eyes -->
      <!-- Left Eye -->
      <ellipse cx="245" cy="188" rx="13" ry="16" fill="#0f172a" />
      <circle cx="242" cy="182" r="5" fill="#ffffff" />
      <circle cx="248" cy="193" r="2" fill="#ffffff" />

      <!-- Right Eye -->
      <ellipse cx="275" cy="190" rx="13" ry="16" fill="#0f172a" />
      <circle cx="272" cy="184" r="5" fill="#ffffff" />
      <circle cx="278" cy="195" r="2" fill="#ffffff" />

      <!-- Friendly Smile -->
      <path d="M 252 215 Q 262 225 272 215" stroke="#064e3b" stroke-width="4" stroke-linecap="round" fill="none" />
      <!-- Cute Blush cheeks -->
      <ellipse cx="236" cy="204" rx="7" ry="4" fill="#f43f5e" opacity="0.5" />
      <ellipse cx="284" cy="206" rx="7" ry="4" fill="#f43f5e" opacity="0.5" />

      <!-- Ant Antennae (with glowing tips) -->
      <!-- Left Antenna -->
      <path d="M 240 160 Q 215 110 185 105" stroke="#34d399" stroke-width="6" stroke-linecap="round" fill="none" />
      <circle cx="185" cy="105" r="10" fill="#6ee7b7" filter="url(#glow)" />

      <!-- Right Antenna -->
      <path d="M 270 160 Q 285 105 320 95" stroke="#34d399" stroke-width="6" stroke-linecap="round" fill="none" />
      <circle cx="320" cy="95" r="10" fill="#6ee7b7" filter="url(#glow)" />

      <!-- Ant Front Arms holding the coin lovingly -->
      <path d="M 245 285 Q 265 295 280 290" stroke="#34d399" stroke-width="10" stroke-linecap="round" fill="none" />
      <circle cx="280" cy="290" r="7" fill="#6ee7b7" />
      
      <path d="M 260 315 Q 285 340 310 330" stroke="#34d399" stroke-width="10" stroke-linecap="round" fill="none" />
      <circle cx="310" cy="330" r="7" fill="#6ee7b7" />
    </g>
  </g>
</svg>
`;

// Android mipmap sizes
const sizes = [
  { dir: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
  { dir: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
  { dir: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
  { dir: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
  { dir: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 },
];

async function generate() {
  const resDir = path.resolve('android/app/src/main/res');

  // Also save web favicon / public icon
  const publicDir = path.resolve('public');
  await sharp(Buffer.from(fullIconSvg)).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(Buffer.from(fullIconSvg)).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(Buffer.from(fullIconSvg)).resize(32, 32).png().toFile(path.join(publicDir, 'favicon.png'));

  // Update Android resources
  for (const { dir, launcherSize, foregroundSize } of sizes) {
    const targetDir = path.join(resDir, dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 1. ic_launcher.png
    await sharp(Buffer.from(fullIconSvg))
      .resize(launcherSize, launcherSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. ic_launcher_round.png
    // Generate rounded mask
    const circleMask = Buffer.from(
      `<svg><circle cx="${launcherSize / 2}" cy="${launcherSize / 2}" r="${launcherSize / 2}" fill="#fff"/></svg>`
    );
    await sharp(Buffer.from(fullIconSvg))
      .resize(launcherSize, launcherSize)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 3. ic_launcher_foreground.png
    await sharp(Buffer.from(foregroundIconSvg))
      .resize(foregroundSize, foregroundSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${dir}`);
  }

  // Update iOS AppIcon (1024x1024)
  const iosIconDir = path.resolve('ios/App/App/Assets.xcassets/AppIcon.appiconset');
  if (fs.existsSync(iosIconDir)) {
    await sharp(Buffer.from(fullIconSvg))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(iosIconDir, 'AppIcon-512@2x.png'));
    console.log('Generated iOS 1024x1024 AppIcon');
  }

  console.log('All icons generated successfully!');
}

generate().catch(console.error);
