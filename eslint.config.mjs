import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint';
import reactPlugin from "eslint-plugin-react";
 
const eslintConfig = defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { 
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { react: reactPlugin },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='img']",
          message: "Do not use native <img> elements. Use Next.js <Image /> component instead to optimize layout shift and performance."
        },
        {
          selector: "JSXOpeningElement[name.name='a']",
          message: "Do not use native <a> tags for internal routing. Use Next.js <Link /> component instead to ensure client-side navigation."
        },
        {
          selector: "JSXOpeningElement[name.name='script']:not([src])",
          message: "Inline <script> tags can degrade performance. Use the Next.js <Script /> component with an explicit strategy instead."
        }
      ]
    },
  },
  globalIgnores([
    'out/**',
    'dist/**',
    '.next/**'
  ]),
])
 
export default eslintConfig
