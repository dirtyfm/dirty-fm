import assert from "node:assert/strict";
import { describe, it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

describe("Dirty News public comment rendering", () => {
  it("escapes script-looking text instead of rendering executable HTML", () => {
    const html = renderToStaticMarkup(
      React.createElement("p", null, "<script>alert('static')</script>")
    );

    assert.equal(html, "<p>&lt;script&gt;alert(&#x27;static&#x27;)&lt;/script&gt;</p>");
    assert.equal(html.includes("<script>"), false);
  });
});
