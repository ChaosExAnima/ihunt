import { dirname } from 'path';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import perfectionist from 'eslint-plugin-perfectionist';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	perfectionist.configs['recommended-alphabetical'],
	...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
