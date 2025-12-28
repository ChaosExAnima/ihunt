import type { ResizingType } from '@imgproxy/imgproxy-js-core';

import { useQuery } from '@tanstack/react-query';
import {
	ImgHTMLAttributes,
	RefCallback,
	useCallback,
	useMemo,
	useState,
} from 'react';
import { thumbHashToDataURL } from 'thumbhash';

import { trpc } from '@/lib/api';
import { PhotoSchema } from '@/lib/schemas';

export interface PhotoDisplayProps extends ImgHTMLAttributes<HTMLImageElement> {
	fit?: ResizingType;
	height?: number;
	photo: PhotoSchema;
	width?: number;
}

export default function PhotoDisplay({
	alt = '',
	fit = 'fit',
	height,
	photo,
	width,
	...props
}: PhotoDisplayProps) {
	const blurryUrl = useMemo(() => {
		if (!photo.blurry) {
			return undefined;
		}
		const binary = new Uint8Array(
			atob(photo.blurry)
				.split('')
				.map((x) => x.charCodeAt(0)),
		);
		return thumbHashToDataURL(binary);
	}, [photo.blurry]);

	const [dimensions, setDimensions] = useState({ height, width });
	const imgRef: RefCallback<HTMLImageElement> = useCallback((ref) => {
		if (!ref) {
			return;
		}
		setDimensions((prev) => ({
			height:
				Math.ceil(
					max(
						prev.height,
						ref.parentElement?.offsetHeight,
						ref.offsetHeight,
					) * window.devicePixelRatio,
				) || undefined,
			width:
				Math.ceil(
					max(
						prev.width,
						ref.parentElement?.offsetWidth,
						ref.offsetWidth,
					) * window.devicePixelRatio,
				) || undefined,
		}));
	}, []);

	const { data } = useQuery({
		...trpc.photos.get.queryOptions({
			id: photo.id,
			resizing_type: fit,
			...dimensions,
		}),
		staleTime: Infinity, // Image data is never stale as the URLs generated are unique.
	});
	const src = data?.url ?? blurryUrl;

	return (
		<img
			{...props}
			alt={alt}
			height={height}
			ref={imgRef}
			src={src}
			width={width}
		/>
	);
}

function max(...numbers: unknown[]) {
	return Math.max(...numbers.filter((n) => typeof n === 'number'), 0);
}
