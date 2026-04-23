import { expect, type Locator, type Page } from '@playwright/test'

export const goToBookingForm = async (page: Page): Promise<void> => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Записаться' }).click()
  await expect(page).toHaveURL(/\/book$/)
  await page.locator('[data-testid^="select-event-type-"]').first().click()
  await expect(page).toHaveURL(/\/book\/.+/)
}

export const pickFirstAvailableSlot = async (page: Page): Promise<Locator> => {
  const slot = page.locator('[data-testid^="slot-option-"]:not([disabled])').first()
  await expect(slot).toBeVisible()
  await slot.click()
  return slot
}

export const fillGuestForm = async (
  page: Page,
  guest: { name: string; email: string; note?: string },
): Promise<void> => {
  await page.getByTestId('guest-name-input').fill(guest.name)
  await page.getByTestId('guest-email-input').fill(guest.email)
  if (guest.note) {
    await page.getByTestId('guest-note-input').fill(guest.note)
  }
}
