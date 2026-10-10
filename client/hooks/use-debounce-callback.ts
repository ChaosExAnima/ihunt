import { useEffect, useRef } from 'react';

export function useDebounceCallback<Value>(
	callback: (v: Value) => void,
	value: Value,
	delay = 500,
) {
	const lastValue = useRef(value);
	const timer = useRef<ReturnType<typeof setTimeout>>(null);
	useEffect(() => {
		if (value !== lastValue.current) {
			lastValue.current = value;
			if (timer.current) {
				clearTimeout(timer.current);
			}
			timer.current = setTimeout(() => callback(value), delay);
		}
		return () => {
			if (timer.current) {
				clearTimeout(timer.current);
			}
		};
	}, [callback, delay, value]);
}
