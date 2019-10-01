export type BrowserStep = {
  locator: Locator;
  pageId?: number;
  sourceEventId?: number;
  type: "click" | "type";
  value?: string;
};

export type Job = {
  name: string;
  steps: BrowserStep[];
  url: string;
};

export type Locator = {
  classList?: string[] | null;
  href?: string | null;
  id?: string | null;
  inputType?: string | null;
  labels?: string[] | null;
  name?: string | null;
  parentText?: string[] | null;
  placeholder?: string | null;
  tagName?: string | null;
  textContent?: string | null;
  xpath?: string | null;
};

export type Run = {
  name: string;
  startTime: Date;
  status: Status;
  steps: Step[];
};

export type Runs = {
  runs: Run[];
  summary: Summary | null;
};

export type Status = "fail" | "pass" | "queued" | "runs" | "unreached";

export type Step = {
  name: string;
  status: Status;
};

export type Summary = {
  fail: number;
  pass: number;
  total: number;
};