import { logger } from "@qawolf/logger";
import { CssSelector, FindElementOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page, Serializable } from "puppeteer";

export const findCss = async (
  page: Page,
  selector: CssSelector,
  options: FindElementOptions
): Promise<ElementHandle<Element>> => {
  logger.verbose("findCss");

  const jsHandle = await page.evaluateHandle(
    (selector, options) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const findCmd = () => qawolf.find.findCss(selector, options);
      // store the last find on the window for easy debugging
      (window as any).qaw_find = findCmd;
      return findCmd();
    },
    selector as any,
    options as Serializable
  );

  const element = jsHandle.asElement();
  if (!element) throw new Error("Element not found");

  return element;
};
