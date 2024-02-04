import { expect, test } from '@playwright/test'

test('popup window responds to changes in width', async ({ page }) => {
	await page.goto('/')

	// Listen for the popup event
	const [popup] = await Promise.all([
		// This promise resolves to the popup page when the event is fired.
		page.waitForEvent('popup'),
		// Trigger the action that opens the popup.
		page.getByRole('button', { name: 'Open Popup' }).click()
	])

	await expect(popup).toBeDefined()

	const widthSlider = await page.locator('#widthInput')
	// await widthSlider.evaluate((element, value) => ((element as HTMLInputElement).value = value), '500')
	await widthSlider.evaluate((element, value) => {
		const inputElement = element as HTMLInputElement
		inputElement.value = value
		// Dispatch both input and change events for broader compatibility
		inputElement.dispatchEvent(new Event('input', { bubbles: true }))
		inputElement.dispatchEvent(new Event('change', { bubbles: true }))
	}, '500')
	await expect(await widthSlider.inputValue()).toEqual('500')
	await expect(await page.locator('#widthResult').textContent()).toEqual('500')
	await new Promise(res => setTimeout(res, 5000))
	// await popup.waitForFunction((expectedWidth) => window.innerWidth === expectedWidth, 500, { timeout: 5000 })
	const popupWidth = await popup.evaluate(() => window.innerWidth)
	// This line remains to explicitly assert the popup width after waiting
	
	// This throws an error in testing, even though in real life the browser does actually change
	// not sure exactly why, perhaps a limitation of inter-window communication in playwright!
	await expect(popupWidth).toEqual(500)
})
