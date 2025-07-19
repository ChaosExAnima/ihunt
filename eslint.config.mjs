import { FlatCompat } from '@eslint/eslintrc';
import perfectionist from 'eslint-plugin-perfectionist';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

/**
 * @type {import('eslint').Linter.Config}
 */
const eslintConfig = [
	perfectionist.configs['recommended-alphabetical'],
	// ...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		rules: {
			'perfectionist/sort-imports': [
				'error',
				{
					internalPattern: ['^@/.+'],
				},
			],
			'perfectionist/sort-modules': [
				'error',
				{
					partitionByNewLine: true,
				},
			],
		},
	},
];

export default eslintConfig;
