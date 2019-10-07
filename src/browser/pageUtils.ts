import { Page } from "puppeteer";

export const retryAsync = async (
  func: () => Promise<any>,
  times: number = 3
): Promise<any> => {
  for (let i = 0; i < times; i++) {
    try {
      return await func();
    } catch (error) {
      if (
        i < times &&
        error.message ===
          "Execution context was destroyed, most likely because of a navigation."
      ) {
        continue;
      }

      throw error;
    }
  }
};

export const $xText = async (page: Page, xpath: string): Promise<string> => {
  return await retryAsync(async () => {
    const elements = await page.$x(xpath);

    const text = await page.evaluate(
      element => element.textContent,
      elements[0]
    );

    return text;
  });
};
