import { expect, test } from '@playwright/test'
import { fillGuestForm, goToBookingForm, pickFirstAvailableSlot } from './helpers'

test('guest can complete booking flow from home page', async ({ page }) => {
  await goToBookingForm(page)
  await pickFirstAvailableSlot(page)

  const uid = Date.now()
  await fillGuestForm(page, {
    name: `E2E Guest ${uid}`,
    email: `e2e+${uid}@example.com`,
    note: 'Happy path booking',
  })

  await page.getByTestId('submit-booking-button').click()

  await expect(page.getByText('Бронирование создано')).toBeVisible()
  await expect(page).toHaveURL(/\/book$/)
})
