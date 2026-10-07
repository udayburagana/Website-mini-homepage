// Existing scene tests exercise the page after its initial chooser is dismissed.
export async function dismissInitialChooser(page) {
  if (!/^https?:/.test(page.url())) return;
  await page.evaluate(() => {
    if (document.querySelector('[data-persona-selector]')?.open) window.EzRewardsPersona.closePersonaSelector();
  });
}
