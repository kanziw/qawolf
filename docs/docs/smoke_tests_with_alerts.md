---
id: smoke_tests_with_alerts
title: 🔥 Smoke Tests with Alerts
---

You may have experienced this: someone pushed code to production and now a critical user workflow is broken. Despite your team’s best efforts, the bug slipped through. How could you have caught it before a user did? 😱

In this tutorial, we’ll learn about smoke testing as a line of defense against bugs on production. We’ll set up smoke tests on a website, and build an alerting system that tells us when something isn’t working. Let’s get started!

## What are smoke tests?

Smoke tests are tests that cover the most important functionality of an application. For example, on Netflix the critical user workflows include signing in, searching for a show, and watching a show. The term “smoke test” originated in hardware repair, where a machine would fail the smoke test if it caught on fire when turned on. 🔥

[According to Microsoft](<https://docs.microsoft.com/en-us/previous-versions/ms182613(v=vs.80)?redirectedfrom=MSDN>), “smoke testing is the most cost-effective method for identifying and fixing defects in software” after code reviews. This is because smoke tests are **not** intended to cover every permutation and edge case. Instead, smoke tests verify that the critical functionality isn't broken to the point where further testing would be unnecessary.

The book [<i>Lessons Learned in Software Testing</i>](https://www.oreilly.com/library/view/lessons-learned-in/9780471081128/) summarizes it well: "smoke tests broadly cover product features in a limited time...if key features don't work or if key bugs haven't yet been fixed, your team won't waste further time installing or testing."

## Set up project

Let’s set up our project for our first smoke test! First, make sure that you have [Node.js installed](https://nodejs.org/en/download/). To get started, either create a new [Node.js](ttps://nodejs.org) project, or change directories into an existing one.

To create a new project, run the following in the command line:

```bash
mkdir smoke-tests
cd smoke-tests
npm init -y
```

You can follow along in this example GitHub repository. [Your code base should now look like this.](https://github.com/qawolf/tutorials-smoke-tests/tree/ee0d7d51265215ae9abe9a1579c7da99a414f78b)

Now we need to install the `qawolf` [npm package](https://www.npmjs.com/package/qawolf). `qawolf` is an open source Node.js library that generates [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test code from your browser interactions. It also allows you to quickly [set up running your tests on a schedule in various CI providers](set_up_ci).

In the command line, run the following to install `qawolf` as a dev dependency in your project:

```bash
npm i -D qawolf
```

[Your code base should now look like this.](https://github.com/qawolf/tutorials-smoke-tests/tree/8d08948a3080e1c2abcf0489a40a653b39d5e98e)

## Create a smoke test

Now let's create our first smoke test. In this tutorial, we'll smoke test [TodoMVC](http://todomvc.com/examples/react), a simple todo application. Specifically, we'll create a todo item, complete it, and clear completed todos.

When we run the `npx qawolf record` command, a [Chromium](https://www.chromium.org/Home) browser will open and capture our actions such as clicks and typing into inputs. These actions will then be converted to [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test code (more on this in the [review code section](smoke_tests_with_alerts#review-smoke-test-code)).

To record your test, run the following in the command line. You can optionally replace `http://todomvc.com/examples/react` with a different URL, and `myFirstSmokeTest` with a different name.

```bash
npx qawolf record http://todomvc.com/examples/react myFirstSmokeTest
```

Inside the Chromium browser, go through the workflow you want to test as a user would. In our example, we'll 1) create a todo item, 2) mark it as complete, and 3) clear completed todos. After you are done, return to the terminal and hit Enter to save your test. See the video below for an example.

TODO: INSERT VIDEO

[Your code base should now look like this.](https://github.com/qawolf/tutorials-smoke-tests/tree/caa0fccc1ee3472b2108fd03148cac6c6848134c) We'll dive deeper into the test code shortly, but first let's run our test locally.

## Run smoke test locally

Let's run our test to confirm it works locally. In the command line, run the following (replacing `myFirstSmokeTest` with your test name if applicable):

```bash
npx qawolf test myFirstSmokeTest
```

A Chromium browser will open and the test will run. See the video below for an example.

TODO: INSERT VIDEO

## Review smoke test code

Here we'll review our test code and optionally edit it. You'll notice that a folder with the name `.qawolf` was created at the root level of your project. This folder holds two more folders: `.qawolf/tests` and `.qawolf/selectors`. Our test is in the `.qawolf/tests` folder with the name `myFirstSmokeTest.test.js` (or whatever else you named your test). The `.qawolf` directory structure is shown below.

```bash
.qawolf # current directory
├── tests
│   └── myFirstSmokeTest.test.js
├── selectors
│   └── myFirstSmokeTest.json
```

Let's look at the generated test code in `.qawolf/tests/myFirstSmokeTest.test.js`. The test code includes the `qawolf` library, which is built on top of [Puppeteer](https://pptr.dev/) to automate browser actions.

In short, the following code will first open a Chromium browser with our desired URL. It then goes through each step in our workflow. In our case, we 1) type our todo item into the first element we interacted with, 2) hit Enter, 3) click to complete the todo, and 4) click the "Clear completed" button. Each of these steps corresponds to a [Jest test case](https://jestjs.io/docs/en/api#testname-fn-timeout). After the test is complete, the browser is closed.

```js
const { launch } = require("qawolf");
const selectors = require("../selectors/myFirstSmokeTest");

describe("myFirstSmokeTest", () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({ url: "http://todomvc.com/examples/react" });
  });

  afterAll(() => browser.close());

  it('can type into "What needs to be done?" input', async () => {
    await browser.type(selectors[0], "create smoke test!");
  });

  it("can Enter", async () => {
    await browser.type(selectors[1], "↓Enter↑Enter");
  });

  it("can click input", async () => {
    await browser.click(selectors[2]);
  });

  it('can click "Clear completed" button', async () => {
    await browser.click(selectors[3]);
  });
});
```

A few other things about the test code are worth mentioning before we move on.

### Element Selectors

First, the `click` and `type` methods on `browser` take an object of [type `Selector`](api#interface-selector). By default, these selectors are stored in the `.qawolf/selectors/myFirstSmokeTest.json` file. The test code then imports them:

```js
const selectors = require("../selectors/myFirstSmokeTest");
```

Each generated selector is an object. The object includes the following keys:

- `index`: which step number the element corresponds to, starting at `0`
- `page`: which page number the element is on (relevant when the workflow has mulitple pages or tabs)
- `html`: the node that was interacted with, and its two direct [ancestors](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement)

Below is an example of a selector object:

```json
{
  "index": 0,
  "page": 0,
  "html": {
    "ancestors": [
      "<header class=\"header\" data-reactid=\".0.0\"></header>",
      "<div data-reactid=\".0\"></div>"
    ],
    "node": "<input class=\"new-todo\" placeholder=\"What needs to be done?\" value=\"\" data-reactid=\".0.0.1\"/>"
  }
}
```

You don't need to worry too much about the selector object. The most important point is that it includes all the information it can about the target element and its two ancestors. The `qawolf` library can therefore find the target element based on multiple attributes. This helps make tests robust to changes in your application as well as dynamic attributes like CSS classes. If a close enough match for the target element is not found, the test will fail.

You can optionally replace the default selector with a custom CSS or text selector (more on this in the [edit code section](smoke_tests_with_alerts#use-custom-selectors)). See documentation on [how element selectors work](how_it_works#-element-selectors) and on [the `Selector` interface](api#interface-selector) to learn more.

### Automatic Waiting

QA Wolf is built to avoid [flaky tests](https://whatis.techtarget.com/definition/flaky-test), so automatic waiting comes out of the box. This means that the `click` and `type` methods on the `browser` automatically wait for element to appear before moving on. For example, after we click to complete our todo, it takes a bit of time for the "Clear completed" button to appear on the page. In this case, the `qawolf` library will keep looking for the "Clear completed" button until it appears, at which point it will be clicked.

Automatic waiting allows us to avoid writing custom waiting logic or arbitrary sleep statements. See documentation on the [QA Wolf Browser class](api#class-browser) and on [automatic waiting](how_it_works#️-automatic-waiting) to learn more.

At this point, feel free to create additional smoke tests before moving on.

## Optional: Edit smoke test code

You can use the test code as is to verify that the workflow isn't broken. If a step of the workflow cannot be executed because no match is found for the target element, the test will fail.

However, you can still edit the test code to suit your use case. This section provides examples for [adding an assertion](smoke_tests_with_alerts#add-an-assertion), [using a custom CSS or text selector](smoke_tests_with_alerts#use-custom-selectors) to locate an element, or [changing an input value](smoke_tests_with_alerts#change-input-value). Each section is self-contained, so feel free to skip to the section(s) of interest.

### Add an assertion

Let's beef up our test by adding a few assertions. First, we'll add an assertion that the "Clear completed" text appears after we complete our todo.

To do this, we'll use the [`browser.hasText` method](docs/api#browserhastexttext-options). This method automatically waits for the given text to appear on the page. It returns `true` if the text is found, and `false` if the text does not appear before timing out.

In our test code, update the following step where we click to complete the todo. We'll call `browser.hasText("Clear completed")`, assign the result to a variable called `hasClearCompletedText`, and assert that `hasClearCompletedText` is `true`. See [Jest documentation](https://jestjs.io/docs/en/expect) to learn more about assertions.

```js
it("can click input", async () => {
  await browser.click(selectors[2]);

  // custom code starts
  // verify that "Clear completed" text appears
  const hasClearCompletedText = await browser.hasText("Clear completed");
  expect(hasClearCompletedText).toBe(true);
  // custom code ends
});
```

If you run the test again (`npx qawolf test myFirstSmokeTest`), you'll see that it still passes.

After we clear completed todos, we should no longer see any todos on the page. We'll add code that waits until the todos `<section>` no longer exists on the page to verify that it disappears. To do so, we'll use the [`waitUntil` helper method](api#qawolfwaituntilpredicate-timeoutms-sleepms), which takes a function and a timeout in milliseconds. It waits until the function returns `true`, throwing an error if the timeout is reached. We'll also use the [Puppeteer API](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md).

Now let's update the test code. Here is a summary of what we'll do:

1. Use the [`browser.page` method](api#browserpageoptions) to get the current [Puppeteer `page` instance](https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md#class-page).
2. Call [`waitUntil`](api#qawolfwaituntilpredicate-timeoutms-sleepms), passing it a function that calls [Puppeteer's `page.$` method](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pageselector) to find the todos `<section>`. The `page.$` method runs [`document.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) with the given [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) and returns the matching [Puppeteer `ElementHandle`](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#class-elementhandle) or null if none found.
3. Pass the [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) `section.main` to [Puppeteer's `page.$` method](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pageselector). In [TodoMVC](http://todomvc.com/examples/react), `section.main` contains the todos and will disappear from the page once todos have been cleared.

Once the todos `<section>` no longer exists because the todos have been cleared, we will end the test. If a bug on the application prevents the todos from being cleared, the test will fail.

First, update the first line of your test file to also import `waitUntil` from `qawolf`:

```js
// change this
const { launch } = require("qawolf");
// to this
const { launch, waitUntil } = require("qawolf");
```

Then update the final step of the test:

```js
it('can click "Clear completed" button', async () => {
  await browser.click(selectors[3]);

  // custom code starts
  // get current Puppeteer page instance
  const page = await browser.page();

  // verify that todos disappear after clearing completed
  await waitUntil(async () => {
    // find the todos section on the page
    const todosSection = await page.$("section.main");
    // return true once the secton is null, i.e. no longer exists
    return todosSection === null;
  }, 15000); // wait 15 seconds before timing out
  // custom code ends
});
```

If you run the test again (`npx qawolf test myFirstSmokeTest`), you'll see that it still passes.

[Your code base should now look like this.](https://github.com/qawolf/tutorials-smoke-tests/tree/3ee8e15bf4c10d87549e2a5b2d6549e8c598d95d)

See [QA Wolf API documentation](docs/api) for a full list of methods you can use to write assertions.

### Use custom selectors

As [discussed earlier](smoke_tests_with_alerts#element-selectors), the default selector in the generated test code contains all attributes of an element and its two direct [ancestors](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement). When running a test, the `qawolf` library will wait for a close enough match to the default selector before moving on. If no suitable match is found before timing out, the test will fail.

You may want to edit the test code to use selectors of your choosing rather than the default selector logic. This allows you to be explicit about which element to target in each step of your test.

The two supported custom selectors are [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) and text selectors:

- [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) use CSS rules, for example: `#my-id`, `.my-class`, `div.my-class`, `[data-qa="my-input"]`
- Text selectors find the element that contains the given text

In your test code, replace the default selector (for example, `selectors[0]`) with an object containing either the `css` or `text` key and the desired target value. For example:

```js
it('can click "Clear completed" button', async () => {
  // change this
  await browser.click(selectors[3]);
  // to this (CSS selector)
  await browser.click({ css: ".clear-completed" });
  // or this (text selector)
  await browser.click({ text: "Clear completed" });
});
```

If you change the default selector to either of the above examples, your test will still pass.

Whenever you target an element with a CSS or text selector, make sure that your selector is as specific as possible. If your selector matches multiple elements on the page, you could end up with the wrong element being acted upon in your test.

A best practice in testing is to add [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) like `data-qa` to target elements. This involves editing your front end code, but it allows you to be most explicit about which elements to target when running tests. For example:

```html
<!-- change this -->
<button class="clear-completed">Clear completed</button>
<!-- to this -->
<button data-qa="clear-button" class="clear-completed">Clear completed</button>
```

If you have added a data attribute to an element in your test, you can update the test code to use a CSS selector targeting that data attribute and value.

```js
it('can click "Clear completed" button', async () => {
  // change this
  await browser.click(selectors[3]);
  // to this
  await browser.click({ css: "[data-qa='clear-button']" });
});
```

You can also record your test while setting the [`QAW_DATA_ATTRIBUTE` environment variable](api#qaw_data_attribute). This will use your data attribute to find elements where applicable rather than the default selector logic. For example:

```bash
QAW_DATA_ATTRIBUTE=data-qa npx qawolf record www.myawesomesite.com myTest
```

See [QA Wolf documentation](api#qaw_data_attribute) to learn more about the `QAW_DATA_ATTRIBUTE` environment variable.

### Change input value

## Run smoke tests on a schedule

## Set up alerts on failure

## Next steps