import { expect, test } from '@playwright/test'
import { fillGuestForm, goToBookingForm, pickFirstAvailableSlot } from './helpers'

test('second guest sees conflict when booking an already taken slot', async ({ browser }) => {
  const firstContext = await browser.newContext()
  const secondContext = await browser.newContext()
  const firstPage = await firstContext.newPage()
  const secondPage = await secondContext.newPage()

  const uid = Date.now()
  const firstGuest = {
    name: `E2E First ${uid}`,
    email: `e2e-first+${uid}@example.com`,
  }
  const secondGuest = {
    name: `E2E Second ${uid}`,
    email: `e2e-second+${uid}@example.com`,
  }

  await goToBookingForm(firstPage)
  await goToBookingForm(secondPage)

  const firstSlot = await pickFirstAvailableSlot(firstPage)
  const firstSlotId = await firstSlot.getAttribute('data-testid')
  await expect(firstSlotId).not.toBeNull()

  const sameSlot = secondPage.locator(`[data-testid="${firstSlotId}"]`)
  await expect(sameSlot).toBeVisible()
  await sameSlot.click()

  await fillGuestForm(firstPage, firstGuest)
  await fillGuestForm(secondPage, secondGuest)

  await firstPage.getByTestId('submit-booking-button').click()
  await expect(firstPage.getByText('Бронирование создано')).toBeVisible()

  await secondPage.getByTestId('submit-booking-button').click()
  await expect(secondPage.getByText('Слот уже занят, выберите другой.')).toBeVisible()

  await firstContext.close()
  await secondContext.close()
})
