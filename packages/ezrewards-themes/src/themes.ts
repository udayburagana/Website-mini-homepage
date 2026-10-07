export type EzRewardsTheme = 'visionary' | 'strategist' | 'operator'

export type ThemeMetadata = {
  id: EzRewardsTheme
  name: string
  description: string
  themeColor: string
  supportingAccent: string
  chart: readonly [string, string, string, string, string, string]
}

export declare const DEFAULT_THEME: EzRewardsTheme
export declare const THEME_STORAGE_KEY: 'ezrewards-persona'
export declare const themes: Readonly<Record<EzRewardsTheme, Readonly<ThemeMetadata>>>
export declare function isEzRewardsTheme(value: unknown): value is EzRewardsTheme
