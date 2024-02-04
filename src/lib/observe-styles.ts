// function getParentStyle(element: Node): HTMLStyleElement | null {
// 	if (element instanceof HTMLStyleElement) {
// 		return element
// 	} else {
// 		const parent = element.parentNode
// 		if (parent instanceof HTMLHeadElement || !parent) {
// 			return null
// 		}
// 		return getParentStyle(parent)
// 	}
// }

/**
 * zips an original style element and its associated popup style element along with all
 * their children respective children into a list of associated tuples
 * 
 * @param original original style element
 * @param n newly created style element on the popup window
 * @returns a list of tuples that are either `[original node, popup node]` or `[original HTMLStyleElement, popup HTMLStyleElement]`
 */
function zipStyleElements(
	original: HTMLStyleElement,
	n: HTMLStyleElement
): (readonly [Node, Node])[] {
	const originalChildren = original.childNodes
	return [
		[original, n] as const,
		...[...n.childNodes].map((newChildNode, i) => [originalChildren.item(i), newChildNode] as const)
	]
}

/**
 * syncs the stylesheets and their child nodes with the popup document
 * 
 * @param mutationsList results from a mutation event
 * @param observer 
 * @param map 
 * @param childHead 
 */
function watchStyles(
	mutationsList: MutationRecord[],
	map: Map<Node, Node>,
	childHead: HTMLHeadElement
) {
	mutationsList.forEach((mutation: MutationRecord) => {
		if (mutation.type === 'childList') {
			mutation.removedNodes.forEach((node: Node) => {
				const popupNode = map.get(node)
				if (popupNode) {
                    // tracked node is being deleted, simply remove it from popup
					popupNode.parentNode?.removeChild(popupNode)
					map.delete(node)
				}
			})
			mutation.addedNodes.forEach((node: Node) => {
				const parent = node.parentElement
				if (parent instanceof HTMLHeadElement && node instanceof HTMLStyleElement) {
                    // dealing with a style element at the top node, clone & append and add to head
					const newNode = node.cloneNode(true)
					childHead.appendChild(newNode)
					map.set(node, newNode)
				} else if (parent && map.has(parent)) {
                    // dealing with a node that's being tracked, clone & append to associated parent element
					const popupParent = map.get(parent)!
					const newNode = node.cloneNode(true)
					popupParent.appendChild(newNode)
					map.set(node, newNode)
				}
			})
		} else if (mutation.type === 'attributes' || mutation.type === 'characterData') {
			const node = mutation.target
			if (map.has(node)) {
                // a modification has occurred, clone the old one and swap the new one
				const popupNode = map.get(node)
				const newNode = node.cloneNode(true)
				popupNode?.parentElement?.replaceChild(popupNode, newNode)
				map.set(node, newNode)
			}
		}
	})
}

/**
 * initiates and sustains the style syncing logic with the new popup window
 * 
 * @param popupHead the `head` element of the new popup window
 * @returns a function to destroy the observers
 */
export function enableStyleCopying(popupHead: HTMLHeadElement) {
	// target node to observe (the <head> element)
	const watchNode = globalThis.top?.document.head
	if (watchNode === undefined) throw new Error('Could not retrieve document head')

	// create an observer instance linked to the callback function for syncing
	const observer: MutationObserver = new MutationObserver((mutationsList) => {
		watchStyles(mutationsList, allNodes, popupHead)
	})

    // grab all current original stylesheets as well as their child nodes
    // and put in a map for referencing
	const allNodes = new Map(
		[...watchNode.querySelectorAll('style')].flatMap((node) => {
			const newNode = node.cloneNode(true) as HTMLStyleElement
			popupHead.appendChild(newNode)
			const list = zipStyleElements(node, newNode)
			// observer.observe(node)
			return list
		})
	)

	// it's necessary to watch as much as possible
	const config: MutationObserverInit = {
		attributes: true,
		childList: true,
		subtree: true,
		characterData: true
	}

	// start observing the target node for configured mutations
	observer.observe(watchNode, config)

	return () => {
		observer.disconnect()
        // Remove everything from the popup DOM
		;[...allNodes.values()].forEach((node) => node?.parentNode?.removeChild(node))
		allNodes.clear()
	}
}
