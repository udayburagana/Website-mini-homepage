import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { DEFAULT_THEME, isEzRewardsTheme, themes } from '../src/index.js'

test('exports three immutable themes with six chart colors', () => {
  assert.equal(DEFAULT_THEME, 'visionary')
  assert.deepEqual(Object.keys(themes), ['visionary', 'strategist', 'operator'])
  for (const theme of Object.values(themes)) assert.equal(theme.chart.length, 6)
  assert.equal(isEzRewardsTheme('strategist'), true)
  assert.equal(isEzRewardsTheme('default'), false)
})

test('defines every required semantic token in each theme', async () => {
  const css = await readFile(new URL('../src/themes.css', import.meta.url), 'utf8')
  const required = ['canvas', 'surface', 'surface-raised', 'input', 'text', 'text-muted', 'border', 'accent', 'accent-hover', 'on-accent', 'success', 'warning', 'danger', 'focus']
  for (const name of required) assert.equal((css.match(new RegExp(`--ez-color-${name}:`, 'g')) ?? []).length, 3, name)
})
