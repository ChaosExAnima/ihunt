import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { AttributesWithAsChild } from '@/lib/types';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
	HTMLDivElement,
	AttributesWithAsChild<HTMLDivElement>
>(({ asChild = false, className, ...props }, ref) => {
	const Wrapper = asChild ? Slot : 'div';
	return (
		<Wrapper
			className={cn(
				'rounded-xl border bg-card text-card-foreground shadow-sm',
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		className={cn('flex flex-col space-y-1.5 p-6', className)}
		ref={ref}
		{...props}
	/>
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		className={cn('font-semibold leading-none tracking-tight', className)}
		ref={ref}
		{...props}
	/>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		className={cn('text-sm text-muted-foreground', className)}
		ref={ref}
		{...props}
	/>
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div className={cn('p-6 pt-0', className)} ref={ref} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		className={cn('flex items-center p-6 pt-0', className)}
		ref={ref}
		{...props}
	/>
));
CardFooter.displayName = 'CardFooter';

export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
};
