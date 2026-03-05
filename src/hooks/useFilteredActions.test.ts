import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Action } from "../types.ts";
import {
  filterByStatus,
  filterNextActionsByContext,
  getActionsByStatus,
  useActionsByStatus,
  useNextActionsByContext,
} from "./useFilteredActions.ts";

const sampleActions: Action[] = [
  {
    id: "1",
    title: "home next",
    due_date: "2099-01-02T10:00:00",
    status: "nextActions",
    context: "home",
    text: "",
    urgent: false,
  },
  {
    id: "2",
    title: "work next urgent",
    due_date: "2099-01-03T10:00:00",
    status: "nextActions",
    context: "work",
    text: "",
    urgent: true,
  },
  {
    id: "3",
    title: "waiting",
    due_date: "2099-01-01T10:00:00",
    status: "waiting",
    context: "work",
    text: "",
    urgent: false,
  },
];

test("filterByStatus returns only matching status", () => {
  const waiting = filterByStatus(sampleActions, "waiting");
  assert.equal(waiting.length, 1);
  assert.equal(waiting[0].id, "3");
});

test("filterNextActionsByContext handles all and home correctly", () => {
  const all = filterNextActionsByContext(sampleActions, "all");
  const homeOnly = filterNextActionsByContext(sampleActions, "home");

  assert.deepEqual(all.map((a) => a.id).sort(), ["1", "2"]);
  assert.deepEqual(
    homeOnly.map((a) => a.id),
    ["1"],
  );
});

test("getActionsByStatus with sort keeps urgent first", () => {
  const sorted = getActionsByStatus(sampleActions, "nextActions", true);
  assert.equal(sorted[0].id, "2");
});

test("getActionsByStatus without sort preserves filtered order", () => {
  const unsorted = getActionsByStatus(sampleActions, "nextActions");
  assert.deepEqual(
    unsorted.map((item) => item.id),
    ["1", "2"],
  );
});

test("useActionsByStatus returns sorted results when sort is true", () => {
  function Harness() {
    const result = useActionsByStatus(sampleActions, "nextActions", true);
    return createElement("div", {
      "data-result": result.map((item) => item.id).join(","),
    });
  }

  const html = renderToStaticMarkup(createElement(Harness));
  assert.ok(html.includes('data-result="2,1"'));
});

test("useActionsByStatus uses default sort=false", () => {
  function Harness() {
    const result = useActionsByStatus(sampleActions, "nextActions");
    return createElement("div", {
      "data-result": result.map((item) => item.id).join(","),
    });
  }

  const html = renderToStaticMarkup(createElement(Harness));
  assert.ok(html.includes('data-result="1,2"'));
});

test("useNextActionsByContext filters by context and energy", () => {
  function AllEnergyHarness() {
    const allEnergy = useNextActionsByContext(sampleActions, "all", "all");
    return createElement("div", {
      "data-result": allEnergy.map((item) => item.id).sort().join(","),
    });
  }

  function HighEnergyHarness() {
    const highEnergy = useNextActionsByContext(
      [
        ...sampleActions,
        {
          id: "4",
          title: "high energy task",
          due_date: "2099-01-04T10:00:00",
          status: "nextActions",
          context: "work",
          text: "",
          urgent: false,
          energy: "high",
        },
      ],
      "work",
      "high",
    );
    return createElement("div", {
      "data-result": highEnergy.map((item) => item.id).join(","),
    });
  }

  const allEnergyHtml = renderToStaticMarkup(createElement(AllEnergyHarness));
  const highEnergyHtml = renderToStaticMarkup(createElement(HighEnergyHarness));

  assert.ok(allEnergyHtml.includes('data-result="1,2"'));
  assert.ok(highEnergyHtml.includes('data-result="4"'));
});

test("useNextActionsByContext default selectedEnergy is all", () => {
  function Harness() {
    const result = useNextActionsByContext(sampleActions, "work");
    return createElement("div", {
      "data-result": result.map((item) => item.id).join(","),
    });
  }

  const html = renderToStaticMarkup(createElement(Harness));
  assert.ok(html.includes('data-result="2"'));
});
