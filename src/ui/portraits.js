// Procedural linocut-style busts, built from a handful of facial parameters.
import { CHARS } from '../engine/data.js';

const INK = '#15100c', SKIN = '#dcc9aa', SHADE = '#8f7757';

function hairPath(type, rx, col) {
  const L = 60 - rx, R = 60 + rx;
  switch (type) {
    case 'bald': return `<path d="M${L - 1} 66 q-2 -10 2 -16 l2 14z M${R + 1} 66 q2 -10 -2 -16 l-2 14z" fill="${col}"/>`;
    case 'crop': return `<path d="M${L - 1} 60 C${L - 3} 22 ${R + 3} 22 ${R + 1} 60 C${R - 2} 40 ${L + 2} 40 ${L - 1} 60z" fill="${col}"/>`;
    case 'brushcut': return `<path d="M${L - 1} 58 L${L} 30 Q60 22 ${R} 30 L${R + 1} 58 Q${R - 2} 41 60 40 Q${L + 2} 41 ${L - 1} 58z" fill="${col}"/>`;
    case 'part': return `<path d="M${L - 2} 62 C${L - 5} 20 ${R + 5} 18 ${R + 2} 62 C${R} 46 ${R - 8} 40 ${60 - rx * 0.3} 38 C${L + 6} 41 ${L + 1} 48 ${L - 2} 62z" fill="${col}"/><path d="M${60 - rx * 0.3} 38 L${60 - rx * 0.42} 27" stroke="${SKIN}" stroke-width="1.2"/>`;
    case 'swept': return `<path d="M${L - 3} 62 C${L - 8} 12 ${R + 8} 12 ${R + 3} 62 C${R} 44 ${R - 6} 37 60 36 C${L + 6} 37 ${L} 44 ${L - 3} 62z" fill="${col}"/>`;
    case 'receding': return `<path d="M${L - 2} 66 C${L - 5} 44 ${L} 32 ${L + 9} 30 C${L + 4} 40 ${L + 3} 50 ${L + 1} 62z M${R + 2} 66 C${R + 5} 44 ${R} 32 ${R - 9} 30 C${R - 4} 40 ${R - 3} 50 ${R - 1} 62z" fill="${col}"/>`;
    case 'forelock': return `<path d="M${L - 2} 62 C${L - 5} 18 ${R + 5} 18 ${R + 2} 62 C${R} 44 ${R - 5} 38 ${R - 10} 36 C${60} 44 ${L + 6} 54 ${L + 3} 58 C${L + 2} 50 ${L} 52 ${L - 2} 62z" fill="${col}"/>`;
    default: return '';
  }
}

function stache(type, col) {
  switch (type) {
    case 'walrus': return `<path d="M44 82 Q60 72 76 82 Q80 92 73 95 Q66 86 60 88 Q54 86 47 95 Q40 92 44 82z" fill="${col}"/>`;
    case 'brush': return `<path d="M49 82 Q60 76 71 82 L72 87 Q60 83 48 87z" fill="${col}"/>`;
    case 'small': return `<path d="M52 82 Q60 78 68 82 L68 85 Q60 82 52 85z" fill="${col}"/>`;
    case 'tooth': return `<rect x="55.5" y="78.5" width="9" height="6" rx="1" fill="${col}"/>`;
    case 'goatee': return `<path d="M50 82 Q60 77 70 82 L70 86 Q60 82 50 86z" fill="${col}"/><path d="M53 93 Q60 90 67 93 Q66 106 60 108 Q54 106 53 93z" fill="${col}"/>`;
    default: return '';
  }
}

function dress(type, collar) {
  if (type === 'uniform') return `
    <path d="M4 144 Q8 116 34 110 L60 104 L86 110 Q112 116 116 144z" fill="#4a5345"/>
    <path d="M46 100 h28 v13 l-14 5 l-14 -5z" fill="#3b4438"/><path d="M46 102 h9 v10 l-9 -3z M74 102 h-9 v10 l9 -3z" fill="#8f231b"/>
    <rect x="12" y="114" width="20" height="6" rx="1.5" transform="rotate(-14 22 117)" fill="#c2a257"/><rect x="88" y="114" width="20" height="6" rx="1.5" transform="rotate(14 98 117)" fill="#c2a257"/>
    <path d="M60 118 v26" stroke="#2c332a" stroke-width="1.2"/><circle cx="60" cy="126" r="1.8" fill="#c2a257"/><circle cx="60" cy="137" r="1.8" fill="#c2a257"/>
    <path d="M56 113 l4 -3 l4 3 l-4 5z" fill="#2d4f8a" stroke="#c2a257" stroke-width="0.8"/>`;
  if (type === 'worker') return `
    <path d="M4 144 Q8 118 34 112 L60 108 L86 112 Q112 118 116 144z" fill="#262321"/>
    <path d="M48 104 L60 124 L72 104 L66 102 L60 112 L54 102z" fill="#3a3531"/><path d="M52 104 L60 118 L68 104z" fill="${SHADE}"/>`;
  return `
    <path d="M4 144 Q8 116 34 110 L60 104 L86 110 Q112 116 116 144z" fill="#1a1819"/>
    <path d="M47 ${collar ? 96 : 102} h26 v10 l-13 26 l-13 -26z" fill="#e9e2d2"/>
    ${collar ? '<path d="M47 96 l8 12 l-8 4z M73 96 l-8 12 l8 4z" fill="#fbf7ec" stroke="#b9b09b" stroke-width="0.6"/>' : '<path d="M47 102 l9 8 l-7 5z M73 102 l-9 8 l7 5z" fill="#fbf7ec"/>'}
    <path d="M57 110 h6 l2 6 l-5 22 l-5 -22z" fill="#231d1c"/>
    <path d="M34 110 L54 138 L48 144 M86 110 L66 138 L72 144" stroke="#2e2a2b" stroke-width="1.4" fill="none"/>`;
}

export function portraitSVG(id, size = 120) {
  const c = CHARS[id]; if (!c) return '';
  const rx = 23 * (c.face || 1), hairCol = c.old ? '#b8b2a4' : INK;
  const glasses = c.glasses === 'round'
    ? `<g fill="rgba(255,255,255,0.12)" stroke="${INK}" stroke-width="1.6"><circle cx="50" cy="63" r="7.5"/><circle cx="70" cy="63" r="7.5"/><path d="M57.5 63 h5" fill="none"/><path d="M42.5 62 L${60 - rx} 60 M77.5 62 L${60 + rx} 60" fill="none"/></g>`
    : c.glasses === 'pince' ? `<g fill="rgba(255,255,255,0.12)" stroke="${INK}" stroke-width="1.3"><ellipse cx="51" cy="63" rx="6.5" ry="5.5"/><ellipse cx="69" cy="63" rx="6.5" ry="5.5"/><path d="M57.5 62 q2.5 -3 5 0" fill="none"/><path d="M75.5 64 q6 14 2 34" fill="none" stroke-width="0.7"/></g>` : '';
  const cap = c.dress === 'worker' ? `<path d="M${60 - rx - 3} 46 Q60 14 ${60 + rx + 3} 46 L${60 + rx + 2} 50 Q60 40 ${60 - rx - 2} 50z" fill="#23201e"/><path d="M${60 - rx - 6} 50 Q52 44 ${60 + rx - 4} 50 L${60 + rx - 8} 54 Q50 49 ${60 - rx - 8} 54z" fill="#121010"/>` : '';
  return `<svg class="portrait" viewBox="0 0 120 144" width="${size}" height="${size * 1.2}" xmlns="http://www.w3.org/2000/svg" aria-label="${c.name}">
    <defs><radialGradient id="pg-${id}" cx="35%" cy="25%" r="90%"><stop offset="0" stop-color="${c.tint}" stop-opacity="0.95"/><stop offset="1" stop-color="#14100c"/></radialGradient>
    <clipPath id="pc-${id}"><ellipse cx="60" cy="64" rx="${rx}" ry="30"/></clipPath></defs>
    <rect width="120" height="144" fill="url(#pg-${id})"/>
    <g opacity="0.16" stroke="#000" stroke-width="1">${Array.from({ length: 18 }, (_, i) => `<path d="M${-30 + i * 12} 144 L${30 + i * 12} 0"/>`).join('')}</g>
    <g filter="url(#lino)">
      ${dress(c.dress, c.collar)}
      <path d="M49 88 h22 v18 q-11 8 -22 0z" fill="${SHADE}"/>
      <ellipse cx="${60 - rx}" cy="66" rx="4" ry="7" fill="${SHADE}"/><ellipse cx="${60 + rx}" cy="66" rx="4" ry="7" fill="#6f5b42"/>
      <ellipse cx="60" cy="64" rx="${rx}" ry="30" fill="${SKIN}"/>
      <g clip-path="url(#pc-${id})">
        <path d="M63 30 L67 52 L62 70 L68 84 L62 100 L100 100 L100 30z" fill="${SHADE}" opacity="0.62"/>
        <path d="M30 86 Q60 104 90 86 L90 100 L30 100z" fill="${SHADE}" opacity="0.4"/>
        ${c.old ? `<path d="M46 47 q14 -4 28 0 M48 51 q12 -3 24 0 M44 76 q3 6 1 12 M76 76 q-3 6 -1 12" stroke="${SHADE}" stroke-width="1" fill="none"/>` : ''}
      </g>
      ${hairPath(c.hair, rx, hairCol)}${cap}
      <path d="M43 57 q7 -4 13 -1 M64 56 q6 -3 13 1" stroke="${c.old ? '#8d877b' : INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M45.5 63.5 q4.5 -3 9 0 M65.5 63.5 q4.5 -3 9 0" stroke="${INK}" stroke-width="1.5" fill="none"/>
      <circle cx="50" cy="64.3" r="1.7" fill="${INK}"/><circle cx="70" cy="64.3" r="1.7" fill="${INK}"/>
      <path d="M60 62 L58 76 Q60 78.5 64 76.5" stroke="#6f5b42" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M52 ${c.stache === 'walrus' ? 92 : 88} q8 ${c.old ? 1 : 2.5} 16 0" stroke="#5a3f33" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      ${stache(c.stache, c.old ? '#cfc9bb' : INK)}${glasses}
    </g>
    <rect width="120" height="144" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="3"/>
  </svg>`;
}

/** Shared SVG filter definitions; inject once. */
export const SVG_DEFS = `<svg width="0" height="0" style="position:absolute"><defs>
  <filter id="lino" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter>
  <filter id="paperNoise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.08  0 0 0 0.22 0"/></filter>
</defs></svg>`;
