import type { SupportedLocale } from '@/types';
import type { AIRequest } from './types';

export function getSystemPrompt(locale: SupportedLocale): string {
  if (locale === 'es') {
    return (
      'Eres un lector de tarot reflexivo y con experiencia. ' +
      'Proporciona una interpretación perspicaz de la siguiente lectura. ' +
      'Habla directamente al consultante con un tono cálido y equilibrado. ' +
      'Sé específico sobre las cartas y sus posiciones. Evita los clichés.'
    );
  }
  return (
    'You are a thoughtful, knowledgeable tarot reader. ' +
    'Provide an insightful interpretation of the following reading. ' +
    'Speak directly to the querent in a warm, grounded tone. ' +
    'Be specific to the cards drawn and their positions. Avoid generic platitudes.'
  );
}

export function buildPrompt(req: AIRequest): string {
  const { resolvedCards, notes, locale } = req;

  const spreadName = req.resolvedSpreadName ?? req.spread.id;

  const isES = locale === 'es';

  const lines: string[] = [];

  lines.push(isES ? `TIRADA: ${spreadName}` : `SPREAD: ${spreadName}`);
  if (req.resolvedSpreadDescription) {
    lines.push(req.resolvedSpreadDescription);
  }
  lines.push('');

  if (resolvedCards && resolvedCards.length > 0) {
    lines.push(isES ? 'CARTAS:' : 'CARDS:');
    for (const rc of resolvedCards) {
      lines.push(`${rc.positionLabel} — ${rc.positionDesc}`);
      const orientLabel = rc.orientation === 'reversed'
        ? (isES ? 'invertida' : 'reversed')
        : (isES ? 'al derecho' : 'upright');
      lines.push(`${isES ? 'Carta' : 'Card'}: ${rc.cardName} (${orientLabel})`);
      lines.push(`${isES ? 'Significado' : 'Meaning'}: ${rc.meaning}`);
      lines.push('');
    }
  }

  if (notes && notes.trim()) {
    lines.push(isES ? `NOTAS DEL CONSULTANTE: ${notes.trim()}` : `QUERENT'S NOTES: ${notes.trim()}`);
    lines.push('');
  }

  lines.push(
    isES
      ? 'Interpreta esta tirada en su conjunto. Señala la interacción entre las cartas, los patrones emergentes y las tensiones. Termina con una reflexión concreta y útil.'
      : 'Interpret this reading as a whole. Note the interplay between cards, emerging patterns, and tensions. End with one concise actionable insight.'
  );

  return lines.join('\n');
}
