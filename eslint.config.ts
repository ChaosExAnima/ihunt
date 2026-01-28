import { ConfigObject } from '@eslint/core';
import js from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginRouter from '@tanstack/eslint-plugin-router';
import perfectionist from 'eslint-plugin-perfectionist';
import pluginPrettier from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	...pluginRouter.configs['flat/recommended'],
	pluginQuery.configs['flat/recommended'],
	perfectionist.configs?.['recommended-natural'] as ConfigObject,
	reactHooks.configs.flat.recommended,
	{
		extends: [js.configs.recommended],
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		plugins: { js },
	},
	globalIgnores(['public', 'src/dev-dist', 'dist']),
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
	pluginPrettier,
	{
		rules: {
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/only-throw-error': 'off',
			'@typescript-eslint/unbound-method': 'off',
			'perfectionist/sort-modules': 'warn',
			'perfectionist/sort-objects': 'warn',
			'prettier/prettier': 'warn',
		},
	},
]);
