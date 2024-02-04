import { getByTestId, render } from '@testing-library/svelte';
import InnerStyleTest from './InnerStyleTest.svelte';
import InheritStyleTest from './InheritStyleTest.svelte';

describe('style tests for playwright', () => {
	it('InnerStyleTest has an element with test id "inner-style" with `playwright` text inside', () => {
		render(InnerStyleTest)
		const text = getByTestId(document.body, "inner-style")
		expect(text).toHaveClass('test')
		expect(text).toHaveTextContent('playwright')
	})
	it('InheritStyleTest has yellow text in `inherit-style` test id', () => {
		render(InheritStyleTest)
		expect(getByTestId(document.body, "inherit-style")).toHaveStyle({"background-color": "rgb(255, 255, 0)"})
	})
})
