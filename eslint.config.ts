import js from '@eslint/js';
import pluginRouter from '@tanstack/eslint-plugin-router';
import perfectionist from 'eslint-plugin-perfectionist';
import pluginPrettier from 'eslint-plugin-prettier/recommended';
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
	{
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	pluginReact.configs.flat['jsx-runtime'],
	{
		rules: {
			'@typescript-eslint/no-unsafe-return': 'off',
		},
	},
	pluginPrettier,
]);
