/**
 * Workspace File Tree & Monaco Editor Content Fixtures — tests/fixtures/workspaces.fixture.ts
 */

export interface IWorkspaceFileNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  children?: IWorkspaceFileNode[];
}

export const MOCK_FILE_CONTENTS: Readonly<Record<string, string>> = {
  "/README.md": `# INDEX0 Demo Project

Welcome to the sovereign INDEX0 AI engineering workspace.
This project contains verified TypeScript math utilities executed inside isolated microVM sandboxes.
`,
  "/package.json": `{
  "name": "index0-demo-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --test test/**/*.test.ts",
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "^5.4.5"
  }
}
`,
  "/tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true
  }
}
`,
  "/src/index.ts": `/**
 * Main Application Entry Point
 */
import { add, multiply } from "./math.js";

console.log("INDEX0 Math Engine Demo");
console.log("2 + 3 =", add(2, 3));
console.log("4 * 5 =", multiply(4, 5));
`,
  "/src/math.ts": `/**
 * Safe Math Utilities
 */

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}
`,
  "/test/math.test.ts": `import { describe, it } from "node:test";
import assert from "node:assert";
import { add, multiply, subtract } from "../src/math.js";

describe("Math Utilities Test Suite", () => {
  it("should add numbers correctly", () => {
    assert.strictEqual(add(2, 3), 5);
  });

  it("should multiply numbers correctly", () => {
    assert.strictEqual(multiply(4, 5), 20);
  });

  it("should subtract numbers correctly", () => {
    assert.strictEqual(subtract(10, 4), 6);
  });
});
`
};

export const MOCK_WORKSPACE_FILE_TREE: IWorkspaceFileNode[] = [
  {
    id: "node-readme",
    name: "README.md",
    path: "/README.md",
    type: "file",
    size: MOCK_FILE_CONTENTS["/README.md"]?.length
  },
  {
    id: "node-pkg",
    name: "package.json",
    path: "/package.json",
    type: "file",
    size: MOCK_FILE_CONTENTS["/package.json"]?.length
  },
  {
    id: "node-tsconfig",
    name: "tsconfig.json",
    path: "/tsconfig.json",
    type: "file",
    size: MOCK_FILE_CONTENTS["/tsconfig.json"]?.length
  },
  {
    id: "node-src",
    name: "src",
    path: "/src",
    type: "directory",
    children: [
      {
        id: "node-src-index",
        name: "index.ts",
        path: "/src/index.ts",
        type: "file",
        size: MOCK_FILE_CONTENTS["/src/index.ts"]?.length
      },
      {
        id: "node-src-math",
        name: "math.ts",
        path: "/src/math.ts",
        type: "file",
        size: MOCK_FILE_CONTENTS["/src/math.ts"]?.length
      }
    ]
  },
  {
    id: "node-test",
    name: "test",
    path: "/test",
    type: "directory",
    children: [
      {
        id: "node-test-math",
        name: "math.test.ts",
        path: "/test/math.test.ts",
        type: "file",
        size: MOCK_FILE_CONTENTS["/test/math.test.ts"]?.length
      }
    ]
  }
];

export function findFileNode(
  tree: IWorkspaceFileNode[],
  path: string
): IWorkspaceFileNode | null {
  for (const node of tree) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFileNode(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function getFileContent(path: string): string | null {
  return MOCK_FILE_CONTENTS[path] || null;
}

export function flattenFileTree(tree: IWorkspaceFileNode[]): IWorkspaceFileNode[] {
  const result: IWorkspaceFileNode[] = [];
  function traverse(nodes: IWorkspaceFileNode[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children) {
        traverse(node.children);
      }
    }
  }
  traverse(tree);
  return result;
}
