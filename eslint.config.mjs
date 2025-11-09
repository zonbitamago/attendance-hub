import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([globalIgnores([
    "**/node_modules/",
    "**/dist/",
    "**/build/",
    "**/.next/",
    "**/out/",
    "**/coverage/",
    "**/*.min.js",
    "**/*.min.css",
    "**/*.tsbuildinfo",
    "**/next-env.d.ts",
    "**/.vscode/",
    "**/.idea/",
    "**/*.log",
    "**/.env*",
]), {
    extends: [...nextCoreWebVitals],
    rules: {
        "react-hooks/set-state-in-effect": "warn",
    },
}]);