import { expect, test } from '@playwright/test'
import { goToBookingForm } from './helpers'

test('invalid email and missing slot prevent submit', async ({ page }) => {
  await goToBookingForm(page)

  await page.getByTestId('guest-name-input').fill('Validation Guest')
  await page.getByTestId('guest-email-input').fill('not-an-email')

  await expect(page.getByTestId('guest-email-error')).toBeVisible()
  await expect(page.getByTestId('submit-booking-button')).toBeDisabled()
})
