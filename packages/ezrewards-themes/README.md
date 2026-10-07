# EzRewards themes

Versioned semantic tokens for the Visionary, Strategist, and Operator product experiences. This package intentionally excludes homepage layouts and cinematic behavior.

```tsx
import '@udayburagana/ezrewards-themes/tokens.css'
import '@udayburagana/ezrewards-themes/themes.css'
import '@udayburagana/ezrewards-themes/components.css'
import { DEFAULT_THEME, themes, type EzRewardsTheme } from '@udayburagana/ezrewards-themes'
```

Apply `data-ez-theme="visionary|strategist|operator"` to the document root. Product components should consume `--ez-*` semantic variables. Do not branch component structure by personality.

The package does not load web fonts. Applications should self-host Space Grotesk, Inter, and JetBrains Mono or use their framework's font loader.
