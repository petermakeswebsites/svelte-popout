import { expect, test } from '@playwright/test'

test("popup inherits already set styles", async ({page}) => {
	await page.goto('/')

	// Listen for the popup event
	const [popup] = await Promise.all([
		// This promise resolves to the popup page when the event is fired.
		page.waitForEvent('popup'),
		// Trigger the action that opens the popup.
		page.getByRole('button', { name: 'Open Popup' }).click()
	])
	await expect(popup).toBeDefined()

	const text = page.getByTestId("inherit-style")
	await expect(text).toBeDefined()
	await expect(text).toHaveCSS("background-color", "rgb(255, 255, 0)")
})

test('popup window syncs with changes in stylesheets', async ({ page }) => {
	await page.goto('/')

	// Listen for the popup event
	const [popup] = await Promise.all([
		// This promise resolves to the popup page when the event is fired.
		page.waitForEvent('popup'),
		// Trigger the action that opens the popup.
		page.getByRole('button', { name: 'Open Popup' }).click()
	])

	await expect(popup).toBeDefined()

	// add style to stylesheet
	await page.evaluate(() => {
		const styleNode = document.createElement('style')
		styleNode.id = 'testnode'
		styleNode.innerHTML = '.test { color: rgb(255, 0, 0); }'
		document.head.appendChild(styleNode)
		return document.head.innerHTML
	})

	const text = popup.getByTestId('inner-style')
	await expect(text).toBeDefined()
	await expect(text).toHaveCSS('color', 'rgb(255, 0, 0)')

	// change the text of a stylesheet
	await page.evaluate(() => {
		const styleNode = document.getElementById('testnode')
		if (!styleNode) throw new Error('stylenode not found')
		styleNode.innerHTML = '.test { color: rgb(0, 255, 0); }'
	})

	await expect(text).toHaveCSS('color', 'rgb(0, 255, 0)')

	// remove the stylesheet
	await page.evaluate(() => {
		const styleNode = document.getElementById('testnode')
		if (!styleNode) throw new Error('stylenode not found')
		document.head.removeChild(styleNode)
	})

	await expect(text).toHaveCSS('color', 'rgb(0, 0, 0)')
})