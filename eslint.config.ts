import js from '@eslint/js';
import json from '@eslint/json';
import pluginRouter from '@tanstack/eslint-plugin-router';
import perfectionist from 'eslint-plugin-perfectionist';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config([
	...pluginRouter.configs['flat/recommended'],
	perfectionist.configs['recommended-natural'],
	{
		extends: [js.configs.recommended],
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		plugins: { js },
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
	},
	tseslint.configs.recommendedTypeChecked,
	pluginReact.configs.flat.recommended,
	{
		extends: [json.configs.recommended],
		files: ['**/*.json', '**/*.jsonc'],
		language: 'json/json',
		plugins: { json },
	},
]);
