# Spread System

## How It Works

All spreads are defined as `SpreadDefinition` objects in `src/data/spreads.ts`. The canvas renderer, reading panel, and AI layer all operate generically on `SpreadDefinition` — there are no spread-specific code paths anywhere else in the app.

## Adding a New Spread

Add one object to the `SPREAD_DEFINITIONS` array in `src/data/spreads.ts`. Then add the translation keys to `messages/en.json` and `messages/es.json`. No other files need to change.

```typescript
{
  id: 'my-new-spread',          // URL-safe slug, becomes /reading/my-new-spread
  nameKey: 'spreads.myNewSpread.name',
  descriptionKey: 'spreads.myNewSpread.description',
  cardCount: 3,
  isConstellation: false,
  previewLayout: 'linear',
  positions: [
    {
      id: 'pos-1',
      labelKey: 'spreads.myNewSpread.positions.pos1',
      descriptionKey: 'spreads.myNewSpread.positions.pos1Desc',
      x: 0.2, y: 0.5           // normalized 0–1 within a 4:3 bounding box
    },
    // ...
  ]
}
```

## Coordinate System

Position coordinates are normalized in a 4:3 bounding box:
- `x: 0` = left edge, `x: 1` = right edge
- `y: 0` = top edge, `y: 1` = bottom edge
- `x: 0.5, y: 0.5` = center

`cardGeometry.ts` maps these to actual canvas pixels at render time, accounting for card size, padding, and canvas dimensions.

## Special Position: Rotation

The `rotation` field (degrees) rotates a card in the canvas. The Celtic Cross uses `rotation: 90` for the crossing card. Cards rotated 180° are visually reversed (for reversed card display).

## Constellation Spreads

Constellation spreads have `isConstellation: true`, `cardCount: 0`, and an empty `positions: []` array. The user places cards freely on the canvas. Each placed card stores its pixel coordinates (`canvasX`, `canvasY`) and optionally a custom label.

## Predefined Spreads

| id | Cards | Layout |
|---|---|---|
| `one-card` | 1 | linear |
| `two-card` | 2 | linear |
| `three-card-ppf` | 3 | linear |
| `three-card-mbs` | 3 | linear |
| `three-card-sao` | 3 | linear |
| `triad` | 3 | linear |
| `celtic-cross` | 10 | cross |
| `zodiac` | 12 | circle |
| `yearly-calendar` | 13 | circle |
| `birthday-solar` | 9 | grid |
| `constellation` | variable | free |
