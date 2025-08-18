import { PropsWithChildren } from 'react';
import {
	SimpleForm as RaSimpleForm,
	SimpleFormProps as RaSimpleFormProps,
} from 'react-admin';
import { FieldValues, Resolver } from 'react-hook-form';

interface SimpleFormProps<Values extends FieldValues = FieldValues>
	extends Omit<RaSimpleFormProps, 'resolver'> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	resolver?: Resolver<Values, any, Values>;
}

export const SimpleForm = <Values extends FieldValues>({
	children,
	...props
}: PropsWithChildren<SimpleFormProps<Values>>) => (
	// @ts-expect-error Resolver doesn't type the resolver prop correctly.
	<RaSimpleForm {...props}>{children}</RaSimpleForm>
);
