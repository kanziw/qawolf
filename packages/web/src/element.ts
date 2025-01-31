import { getXpath } from "./xpath";

export const getClickableAncestor = (
  element: HTMLElement,
  attribute: string
): HTMLElement => {
  /**
   * Crawl up until we reach the top "clickable" ancestor.
   * If a target is the descendant of a clickable element with the attribute choose it.
   * If the target is the descendant of "a"/"button"/"input" choose it.
   * Otherwise choose the original element as the target.
   */
  let ancestor = element;
  console.log("get clickable ancestor for", getXpath(element));

  while (ancestor.parentElement) {
    // choose the data value element as the clickable ancestor
    const findValue = getAttributeValue(ancestor, attribute);
    if (findValue) {
      console.log(
        `found clickable ancestor: ${attribute}="${findValue}"`,
        getXpath(ancestor)
      );
      return ancestor;
    }

    // choose the common clickable element type as the clickable ancestor
    if (["a", "button", "input"].includes(ancestor.tagName.toLowerCase())) {
      console.log(
        `found clickable ancestor: ${ancestor.tagName}`,
        getXpath(ancestor)
      );
      return ancestor;
    }

    // stop crawling at the first non-clickable element
    if (
      !isClickable(
        ancestor.parentElement,
        window.getComputedStyle(ancestor.parentElement)
      )
    ) {
      console.log("no clickable ancestor, use target", getXpath(element));
      return element;
    }

    ancestor = ancestor.parentElement;
  }

  return ancestor;
};

export const getAttributeValue = (
  element: HTMLElement,
  attribute: string | null
): string | null => {
  if (!attribute) return null;

  return element.getAttribute(attribute) || null;
};

export const isClickable = (
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration
) => {
  // assume it is clickable if the cursor is a pointer
  const clickable = computedStyle.cursor === "pointer";
  return clickable && isVisible(element, computedStyle);
};

export const isVisible = (
  element: Element,
  computedStyle?: CSSStyleDeclaration
): boolean => {
  const htmlElement = element as HTMLElement;
  if (htmlElement.offsetWidth <= 0 || htmlElement.offsetHeight <= 0) {
    return false;
  }

  if (computedStyle && computedStyle.visibility === "hidden") {
    return false;
  }

  return true;
};
