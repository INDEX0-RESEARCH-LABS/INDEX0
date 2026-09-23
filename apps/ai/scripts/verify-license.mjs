/*
 * Copyright (c) 2026 INDEX0 AI Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL CODE.
 * NOTICE: All information contained herein is, and remains the property of INDEX0 AI Inc.
 * The intellectual and technical concepts contained herein are proprietary to INDEX0 AI Inc.
 * and may be covered by U.S. and Foreign Patents, patents in process, and are protected by
 * trade secret or copyright law. Dissemination of this information or reproduction of this
 * material is strictly forbidden unless prior written permission is obtained from INDEX0 AI Inc.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const COPYRIGHT_SIGNATURE = "Copyright (c) 2026 INDEX0 AI Inc. All Rights Reserved.";
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".glsl", ".mjs"]);
const IGNORED_DIRS = new Set(["node_modules", ".next", "dist", ".turbo"]);

let totalFilesChecked = 0;
const violations = [];

function checkDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        checkDirectory(path.join(dir, entry.name));
      }
    } else {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.has(ext)) {
        totalFilesChecked++;
        const filePath = path.join(dir, entry.name);
        const content = fs.readFileSync(filePath, "utf-8");
        if (!content.includes(COPYRIGHT_SIGNATURE)) {
          violations.push(path.relative(ROOT_DIR, filePath));
        }
      }
    }
  }
}

checkDirectory(path.join(ROOT_DIR, "src"));
checkDirectory(path.join(ROOT_DIR, "scripts"));

console.log(`[LICENSE AUDIT] Checked ${totalFilesChecked} source files in apps/ai.`);

if (violations.length > 0) {
  console.error(`[LICENSE AUDIT FAILED] Found ${violations.length} files missing the proprietary copyright header:`);
  violations.forEach((v) => console.error(`  - ${v}`));
  process.exit(1);
} else {
  console.log(`[LICENSE AUDIT PASSED] All ${totalFilesChecked} files contain the proprietary copyright header.`);
  process.exit(0);
}
