import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsdoc from "eslint-plugin-jsdoc";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: { jsdoc },
    rules: {
      "jsdoc/require-jsdoc": ["warn", {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          ArrowFunctionExpression: true,
        }
      }],
      "jsdoc/no-types": "error",
    }
  }
]);

export default eslintConfig;