import type { SpreadDefinition } from '@/types';

export const SPREAD_DEFINITIONS: SpreadDefinition[] = [
  // ── One Card Pull ──────────────────────────────────────────────
  {
    id: 'one-card',
    nameKey: 'spreads.oneCard.name',
    descriptionKey: 'spreads.oneCard.description',
    cardCount: 1,
    isConstellation: false,
    previewLayout: 'linear',
    positions: [
      { id: 'card', labelKey: 'spreads.oneCard.positions.card', descriptionKey: 'spreads.oneCard.positions.cardDesc', x: 0.5, y: 0.5 },
    ],
  },

  // ── Two Card ───────────────────────────────────────────────────
  {
    id: 'two-card',
    nameKey: 'spreads.twoCard.name',
    descriptionKey: 'spreads.twoCard.description',
    cardCount: 2,
    isConstellation: false,
    previewLayout: 'linear',
    positions: [
      { id: 'option-a', labelKey: 'spreads.twoCard.positions.optionA', descriptionKey: 'spreads.twoCard.positions.optionADesc', x: 0.3, y: 0.5 },
      { id: 'option-b', labelKey: 'spreads.twoCard.positions.optionB', descriptionKey: 'spreads.twoCard.positions.optionBDesc', x: 0.7, y: 0.5 },
    ],
  },

  // ── Three Card: Past / Present / Future ───────────────────────
  {
    id: 'three-card-ppf',
    nameKey: 'spreads.threeCardPPF.name',
    descriptionKey: 'spreads.threeCardPPF.description',
    cardCount: 3,
    isConstellation: false,
    previewLayout: 'linear',
    positions: [
      { id: 'past',    labelKey: 'spreads.threeCardPPF.positions.past',    descriptionKey: 'spreads.threeCardPPF.positions.pastDesc',    x: 0.2, y: 0.5 },
      { id: 'present', labelKey: 'spreads.threeCardPPF.positions.present', descriptionKey: 'spreads.threeCardPPF.positions.presentDesc', x: 0.5, y: 0.5 },
      { id: 'future',  labelKey: 'spreads.threeCardPPF.positions.future',  descriptionKey: 'spreads.threeCardPPF.positions.futureDesc',  x: 0.8, y: 0.5 },
    ],
  },

  // ── Three Card: Mind / Body / Spirit ──────────────────────────
  {
    id: 'three-card-mbs',
    nameKey: 'spreads.threeCardMBS.name',
    descriptionKey: 'spreads.threeCardMBS.description',
    cardCount: 3,
    isConstellation: false,
    previewLayout: 'linear',
    positions: [
      { id: 'mind',   labelKey: 'spreads.threeCardMBS.positions.mind',   descriptionKey: 'spreads.threeCardMBS.positions.mindDesc',   x: 0.2, y: 0.5 },
      { id: 'body',   labelKey: 'spreads.threeCardMBS.positions.body',   descriptionKey: 'spreads.threeCardMBS.positions.bodyDesc',   x: 0.5, y: 0.5 },
      { id: 'spirit', labelKey: 'spreads.threeCardMBS.positions.spirit', descriptionKey: 'spreads.threeCardMBS.positions.spiritDesc', x: 0.8, y: 0.5 },
    ],
  },

  // ── Three Card: Situation / Action / Outcome ──────────────────
  {
    id: 'three-card-sao',
    nameKey: 'spreads.threeCardSAO.name',
    descriptionKey: 'spreads.threeCardSAO.description',
    cardCount: 3,
    isConstellation: false,
    previewLayout: 'linear',
    positions: [
      { id: 'situation', labelKey: 'spreads.threeCardSAO.positions.situation', descriptionKey: 'spreads.threeCardSAO.positions.situationDesc', x: 0.2, y: 0.5 },
      { id: 'action',    labelKey: 'spreads.threeCardSAO.positions.action',    descriptionKey: 'spreads.threeCardSAO.positions.actionDesc',    x: 0.5, y: 0.5 },
      { id: 'outcome',   labelKey: 'spreads.threeCardSAO.positions.outcome',   descriptionKey: 'spreads.threeCardSAO.positions.outcomeDesc',   x: 0.8, y: 0.5 },
    ],
  },

  // ── The Triad: Thesis / Antithesis / Synthesis ────────────────
  {
    id: 'triad',
    nameKey: 'spreads.triad.name',
    descriptionKey: 'spreads.triad.description',
    cardCount: 3,
    isConstellation: false,
    previewLayout: 'linear',
    positions: [
      { id: 'thesis',     labelKey: 'spreads.triad.positions.thesis',     descriptionKey: 'spreads.triad.positions.thesisDesc',     x: 0.2, y: 0.5 },
      { id: 'antithesis', labelKey: 'spreads.triad.positions.antithesis', descriptionKey: 'spreads.triad.positions.antithesisDesc', x: 0.5, y: 0.5 },
      { id: 'synthesis',  labelKey: 'spreads.triad.positions.synthesis',  descriptionKey: 'spreads.triad.positions.synthesisDesc',  x: 0.8, y: 0.5 },
    ],
  },

  // ── Celtic Cross (10 cards) ────────────────────────────────────
  {
    id: 'celtic-cross',
    nameKey: 'spreads.celticCross.name',
    descriptionKey: 'spreads.celticCross.description',
    cardCount: 10,
    isConstellation: false,
    previewLayout: 'cross',
    positions: [
      // Central cross
      { id: 'present',    labelKey: 'spreads.celticCross.positions.present',    descriptionKey: 'spreads.celticCross.positions.presentDesc',    x: 0.32, y: 0.5 },
      { id: 'challenge',  labelKey: 'spreads.celticCross.positions.challenge',  descriptionKey: 'spreads.celticCross.positions.challengeDesc',  x: 0.32, y: 0.5, rotation: 90 },
      { id: 'past',       labelKey: 'spreads.celticCross.positions.past',       descriptionKey: 'spreads.celticCross.positions.pastDesc',       x: 0.16, y: 0.5 },
      { id: 'future',     labelKey: 'spreads.celticCross.positions.future',     descriptionKey: 'spreads.celticCross.positions.futureDesc',     x: 0.48, y: 0.5 },
      { id: 'above',      labelKey: 'spreads.celticCross.positions.above',      descriptionKey: 'spreads.celticCross.positions.aboveDesc',      x: 0.32, y: 0.25 },
      { id: 'below',      labelKey: 'spreads.celticCross.positions.below',      descriptionKey: 'spreads.celticCross.positions.belowDesc',      x: 0.32, y: 0.75 },
      // Right staff (bottom to top)
      { id: 'attitude',   labelKey: 'spreads.celticCross.positions.attitude',   descriptionKey: 'spreads.celticCross.positions.attitudeDesc',   x: 0.72, y: 0.88 },
      { id: 'external',   labelKey: 'spreads.celticCross.positions.external',   descriptionKey: 'spreads.celticCross.positions.externalDesc',   x: 0.72, y: 0.63 },
      { id: 'hopes',      labelKey: 'spreads.celticCross.positions.hopes',      descriptionKey: 'spreads.celticCross.positions.hopesDesc',      x: 0.72, y: 0.38 },
      { id: 'outcome',    labelKey: 'spreads.celticCross.positions.outcome',    descriptionKey: 'spreads.celticCross.positions.outcomeDesc',    x: 0.72, y: 0.13 },
    ],
  },

  // ── Astrological / Zodiac (12 cards) ──────────────────────────
  {
    id: 'zodiac',
    nameKey: 'spreads.zodiac.name',
    descriptionKey: 'spreads.zodiac.description',
    cardCount: 12,
    isConstellation: false,
    previewLayout: 'circle',
    positions: Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const r = 0.38;
      return {
        id: `house-${i + 1}`,
        labelKey: `spreads.zodiac.positions.house${i + 1}`,
        descriptionKey: `spreads.zodiac.positions.house${i + 1}Desc`,
        x: 0.5 + r * Math.cos(angle),
        y: 0.5 + r * Math.sin(angle),
      };
    }),
  },

  // ── Yearly Calendar (13 cards) ────────────────────────────────
  {
    id: 'yearly-calendar',
    nameKey: 'spreads.yearlyCalendar.name',
    descriptionKey: 'spreads.yearlyCalendar.description',
    cardCount: 13,
    isConstellation: false,
    previewLayout: 'circle',
    positions: [
      // 12 months in a circle
      ...Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const r = 0.38;
        return {
          id: `month-${i + 1}`,
          labelKey: `spreads.yearlyCalendar.positions.month${i + 1}`,
          descriptionKey: `spreads.yearlyCalendar.positions.month${i + 1}Desc`,
          x: 0.5 + r * Math.cos(angle),
          y: 0.5 + r * Math.sin(angle),
        };
      }),
      // Theme card in center
      { id: 'theme', labelKey: 'spreads.yearlyCalendar.positions.theme', descriptionKey: 'spreads.yearlyCalendar.positions.themeDesc', x: 0.5, y: 0.5 },
    ],
  },

  // ── Birthday / Solar Return (9 cards) ─────────────────────────
  {
    id: 'birthday-solar',
    nameKey: 'spreads.birthdaySolar.name',
    descriptionKey: 'spreads.birthdaySolar.description',
    cardCount: 9,
    isConstellation: false,
    previewLayout: 'grid',
    positions: [
      { id: 'year-theme',   labelKey: 'spreads.birthdaySolar.positions.yearTheme',   descriptionKey: 'spreads.birthdaySolar.positions.yearThemeDesc',   x: 0.5,  y: 0.18 },
      { id: 'inner-self',   labelKey: 'spreads.birthdaySolar.positions.innerSelf',   descriptionKey: 'spreads.birthdaySolar.positions.innerSelfDesc',   x: 0.25, y: 0.38 },
      { id: 'focus',        labelKey: 'spreads.birthdaySolar.positions.focus',        descriptionKey: 'spreads.birthdaySolar.positions.focusDesc',        x: 0.5,  y: 0.38 },
      { id: 'outer-world',  labelKey: 'spreads.birthdaySolar.positions.outerWorld',  descriptionKey: 'spreads.birthdaySolar.positions.outerWorldDesc',  x: 0.75, y: 0.38 },
      { id: 'challenge',    labelKey: 'spreads.birthdaySolar.positions.challenge',   descriptionKey: 'spreads.birthdaySolar.positions.challengeDesc',   x: 0.25, y: 0.62 },
      { id: 'opportunity',  labelKey: 'spreads.birthdaySolar.positions.opportunity', descriptionKey: 'spreads.birthdaySolar.positions.opportunityDesc', x: 0.5,  y: 0.62 },
      { id: 'support',      labelKey: 'spreads.birthdaySolar.positions.support',     descriptionKey: 'spreads.birthdaySolar.positions.supportDesc',     x: 0.75, y: 0.62 },
      { id: 'lesson',       labelKey: 'spreads.birthdaySolar.positions.lesson',      descriptionKey: 'spreads.birthdaySolar.positions.lessonDesc',      x: 0.35, y: 0.82 },
      { id: 'gift',         labelKey: 'spreads.birthdaySolar.positions.gift',        descriptionKey: 'spreads.birthdaySolar.positions.giftDesc',        x: 0.65, y: 0.82 },
    ],
  },

  // ── Constellation (free / user-placed) ────────────────────────
  {
    id: 'constellation',
    nameKey: 'spreads.constellation.name',
    descriptionKey: 'spreads.constellation.description',
    cardCount: 0,
    isConstellation: true,
    previewLayout: 'free',
    positions: [],
    minCards: 1,
    maxCards: 22,
  },
];

export const SPREAD_MAP = new Map<string, SpreadDefinition>(
  SPREAD_DEFINITIONS.map(s => [s.id, s])
);

export function getSpread(id: string): SpreadDefinition | undefined {
  return SPREAD_MAP.get(id);
}
