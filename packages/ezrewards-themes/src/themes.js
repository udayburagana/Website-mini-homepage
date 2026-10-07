export const DEFAULT_THEME = 'visionary'
export const THEME_STORAGE_KEY = 'ezrewards-persona'

export const themes = Object.freeze({
  visionary: Object.freeze({
    id: 'visionary',
    name: 'Visionary',
    description: 'Human-centered, spacious, and optimistic.',
    themeColor: '#08140E',
    supportingAccent: '#F2D07D',
    chart: ['#82EFC8', '#F2D07D', '#8FDCF0', '#C7A6FF', '#FF9A8F', '#B5DC78'],
  }),
  strategist: Object.freeze({
    id: 'strategist',
    name: 'Strategist',
    description: 'Structured, analytical, and insight-led.',
    themeColor: '#080E22',
    supportingAccent: '#9D7CFF',
    chart: ['#89E9FF', '#9D7CFF', '#5B8CFF', '#79E7BB', '#FFD37A', '#FF9CA8'],
  }),
  operator: Object.freeze({
    id: 'operator',
    name: 'Operator',
    description: 'Compact, technical, and execution-focused.',
    themeColor: '#0B111C',
    supportingAccent: '#2DD4BF',
    chart: ['#38BDF8', '#2DD4BF', '#A78BFA', '#F7C76B', '#FF8F9C', '#93C5FD'],
  }),
})

export function isEzRewardsTheme(value) {
  return typeof value === 'string' && Object.hasOwn(themes, value)
}
