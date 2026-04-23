import { expect, test } from '@playwright/test'
import { fillGuestForm, goToBookingForm, pickFirstAvailableSlot } from './helpers'

test('booking appears in admin calendar details', async ({ page }) => {
  const uid = Date.now()
  const guestName = `E2E Admin Guest ${uid}`
  const guestEmail = `e2e-admin+${uid}@example.com`

  await goToBookingForm(page)
  await pickFirstAvailableSlot(page)
  await fillGuestForm(page, {
    name: guestName,
    email: guestEmail,
    note: 'Check admin visibility',
  })

  await page.getByTestId('submit-booking-button').click()
  await expect(page.getByText('Бронирование создано')).toBeVisible()
  await expect(page).toHaveURL(/\/book$/)

  await page.goto('/admin')
  await expect(page.getByTestId('admin-bookings-calendar')).toBeVisible()

  const calendarEvent = page.locator('.fc-event').first()
  await expect(calendarEvent).toBeVisible()
  await calendarEvent.click()

  await expect(page.getByTestId('booking-details-dialog')).toBeVisible()
  await expect(page.getByTestId('booking-details-guest-name')).toContainText(guestName)
  await expect(page.getByTestId('booking-details-guest-email')).toContainText(guestEmail)
})
