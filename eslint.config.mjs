import { FlatCompat } from '@eslint/eslintrc';
import perfectionist from 'eslint-plugin-perfectionist';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	perfectionist.configs['recommended-alphabetical'],
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		rules: {
			'perfectionist/sort-imports': [
				'error',
				{
					internalPattern: ['^@/.+'],
				},
			],
		},
	},
];

export default eslintConfig;
