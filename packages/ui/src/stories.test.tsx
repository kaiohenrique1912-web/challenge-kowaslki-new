import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import type { ComponentType, ReactElement } from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * Renderiza TODAS as stories do design system no servidor e checa acessibilidade básica:
 * imagens com alt, botões com nome acessível, campos com rótulo, ids únicos.
 * Ao criar um componente com story, ele entra aqui automaticamente.
 */

type StoryArgs = Record<string, unknown>;
type StoryModule = {
  default: {
    title: string;
    component?: ComponentType<StoryArgs>;
    args?: StoryArgs;
    render?: (args: StoryArgs, context: unknown) => ReactElement;
  };
  [name: string]: unknown;
};
type Story = { args?: StoryArgs; render?: (args: StoryArgs, context: unknown) => ReactElement };

type Element = { tag: string; attrs: Record<string, string>; text: string };

async function parse(html: string): Promise<Element[]> {
  const elements: Element[] = [];
  const stack: Element[] = [];
  const rewriter = new HTMLRewriter().on("*", {
    element(el) {
      const attrs: Record<string, string> = {};
      for (const [name, value] of el.attributes) attrs[name] = value;
      const entry: Element = { tag: el.tagName, attrs, text: "" };
      elements.push(entry);
      if (!el.selfClosing && !["img", "input", "br", "hr", "path", "circle"].includes(el.tagName)) {
        stack.push(entry);
        el.onEndTag(() => {
          stack.pop();
        });
      }
    },
    text(chunk) {
      for (const open of stack) open.text += chunk.text;
    },
  });
  await rewriter.transform(new Response(html)).text();
  return elements;
}

function a11yProblems(elements: Element[]): string[] {
  const problems: string[] = [];
  const labelsFor = new Set(elements.filter((e) => e.tag === "label").map((e) => e.attrs.for));
  const ids = elements.map((e) => e.attrs.id).filter(Boolean);
  const duplicated = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicated.length) problems.push(`ids repetidos: ${duplicated.join(", ")}`);

  for (const el of elements) {
    const named = Boolean(el.attrs["aria-label"] || el.attrs["aria-labelledby"] || el.attrs.title);
    if (el.tag === "img" && el.attrs.alt === undefined) problems.push("<img> sem alt");
    if (el.tag === "button" && !named && el.text.trim() === "")
      problems.push("<button> sem nome acessível");
    if (["input", "select", "textarea"].includes(el.tag) && el.attrs.type !== "hidden") {
      const labelled = named || (el.attrs.id && labelsFor.has(el.attrs.id));
      if (!labelled) problems.push(`<${el.tag}> sem rótulo`);
    }
  }
  return problems;
}

const root = import.meta.dir;
const files = [...new Bun.Glob("**/*.stories.tsx").scanSync({ cwd: root })].sort();

describe("stories do design system", () => {
  test("há stories para os componentes", () => {
    expect(files.length).toBeGreaterThanOrEqual(20);
  });

  for (const file of files) {
    test(file.replaceAll("\\", "/"), async () => {
      const mod = (await import(join(root, file))) as StoryModule;
      const meta = mod.default;
      const stories = Object.entries(mod).filter(([name]) => name !== "default") as [
        string,
        Story,
      ][];
      expect(stories.length).toBeGreaterThan(0);

      for (const [name, story] of stories) {
        const args = { ...meta.args, ...story.args };
        const render =
          story.render ??
          meta.render ??
          ((a: StoryArgs) => createElement(meta.component as ComponentType<StoryArgs>, a));
        const Host = () => render(args, { args });
        let html = "";
        try {
          html = renderToStaticMarkup(createElement(Host));
        } catch (error) {
          throw new Error(`${meta.title} › ${name} quebrou ao renderizar: ${String(error)}`);
        }
        const problems = a11yProblems(await parse(html));
        expect({ story: `${meta.title} › ${name}`, problems }).toEqual({
          story: `${meta.title} › ${name}`,
          problems: [],
        });
      }
    });
  }
});
