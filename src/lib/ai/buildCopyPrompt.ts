import type { SupportedLocale } from '@/types';
import type { ResolvedCard } from './types';

interface CopyPromptRequest {
  resolvedSpreadName: string;
  resolvedSpreadDescription?: string;
  resolvedCards: ResolvedCard[];
  notes: string;
  locale: SupportedLocale;
}

const DIVIDER = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

export function buildCopyPrompt(req: CopyPromptRequest): string {
  const { resolvedSpreadName, resolvedSpreadDescription, resolvedCards, notes, locale } = req;
  const isES = locale === 'es';
  const lines: string[] = [];

  // Role instruction
  if (isES) {
    lines.push(
      'Eres un lector de tarot experimentado con profundo conocimiento de la simbología, los arquetipos y los significados tradicionales de las 78 cartas. ' +
      'Proporciona una interpretación reflexiva y matizada de la siguiente lectura. ' +
      'Habla directamente al consultante con un tono cálido y equilibrado. ' +
      'Sé específico sobre las cartas y posiciones extraídas — evita los clichés.'
    );
  } else {
    lines.push(
      'You are an experienced tarot reader with deep knowledge of symbolism, archetypes, and the traditional meanings of all 78 cards. ' +
      'Provide a thoughtful, nuanced interpretation of the following reading. ' +
      'Speak directly to the querent in a warm, grounded tone. ' +
      'Be specific to the cards and positions drawn — avoid generic platitudes.'
    );
  }
  lines.push('');

  // Spread section
  lines.push(DIVIDER);
  lines.push(isES ? `TIRADA: ${resolvedSpreadName}` : `SPREAD: ${resolvedSpreadName}`);
  if (resolvedSpreadDescription) {
    lines.push(resolvedSpreadDescription);
  }
  lines.push(DIVIDER);
  lines.push('');

  // Cards section
  lines.push(isES ? 'CARTAS EXTRAÍDAS:' : 'CARDS DRAWN:');
  lines.push('');

  for (let i = 0; i < resolvedCards.length; i++) {
    const rc = resolvedCards[i];
    const orientLabel = rc.orientation === 'reversed'
      ? (isES ? 'invertida' : 'reversed')
      : (isES ? 'al derecho' : 'upright');

    lines.push(`${i + 1}. ${rc.positionLabel}`);
    lines.push(`   ${isES ? 'Qué revela esta posición' : 'What this position reveals'}: ${rc.positionDesc}`);
    lines.push(`   ${isES ? 'Carta' : 'Card'}: ${rc.cardName} (${orientLabel})`);
    lines.push(`   ${isES ? 'Significado' : 'Meaning'}: ${rc.meaning}`);
    lines.push('');
  }

  // Reflections section (only when notes present)
  if (notes.trim()) {
    lines.push(DIVIDER);
    lines.push(isES ? 'REFLEXIONES DEL CONSULTANTE:' : "QUERENT'S REFLECTIONS:");
    lines.push(notes.trim());
    lines.push(DIVIDER);
    lines.push('');
  }

  // Interpretation guidelines
  if (isES) {
    lines.push('PAUTAS DE INTERPRETACIÓN:');
    lines.push('1. Interpreta cada carta en el contexto de su posición y su relación con las cartas circundantes');
    lines.push('2. Identifica el tema o narrativa general de la lectura');
    lines.push('3. Observa patrones significativos: grupos de palos (temas emocionales, mentales, materiales, de acción), resonancias numéricas, equilibrios o tensiones elementales y agrupaciones de cartas de la corte');
    lines.push('4. Aborda cómo los reversos modifican la lectura (si hay cartas invertidas)');
    lines.push('5. Sintetiza la lectura en un mensaje unificado — no carta por carta, sino como una historia completa');
    lines.push('6. Ofrece 1–2 preguntas o reflexiones específicas y prácticas en las que el consultante pueda actuar');
    lines.push('7. Cierra con una reflexión breve y alentadora que honre el camino del consultante');
  } else {
    lines.push('INTERPRETATION GUIDELINES:');
    lines.push('1. Interpret each card in the context of its position and its relationship to surrounding cards');
    lines.push('2. Identify the overarching theme or narrative of the reading');
    lines.push('3. Note significant patterns: suit clusters (emotional, mental, material, action themes), number resonances, elemental balances or tensions, court card groupings');
    lines.push('4. Address how reversals modify the reading (if any reversed cards are present)');
    lines.push('5. Synthesize into a unified message — not card-by-card, but as a whole story');
    lines.push('6. Offer 1–2 specific, actionable questions or insights the querent can act on');
    lines.push('7. Close with a brief, encouraging reflection that honors the querent\'s journey');
  }

  return lines.join('\n');
}
