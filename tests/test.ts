import { expect, test } from '@playwright/test'

test('popup button opens new window', async ({ page }) => {
	await page.goto('/')

	// Listen for the popup event
	const [popup] = await Promise.all([
		// This promise resolves to the popup page when the event is fired.
		page.waitForEvent('popup'),
		// Trigger the action that opens the popup.
		page.getByRole('button', { name: 'Open Popup' }).click()
	])

	await expect(popup).toBeDefined()
})