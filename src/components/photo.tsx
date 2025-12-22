import type { ResizingType } from '@imgproxy/imgproxy-js-core';

import { useQuery } from '@tanstack/react-query';
import {
	ImgHTMLAttributes,
	RefCallback,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { thumbHashToDataURL } from 'thumbhash';

import { trpc } from '@/lib/api';
import { PhotoSchema } from '@/lib/schemas';

interface PhotoDisplayProps extends ImgHTMLAttributes<HTMLImageElement> {
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
	const [url, setUrl] = useState(() => {
		if (!photo.blurry) {
			return undefined;
		}
		const binary = new Uint8Array(
			atob(photo.blurry)
				.split('')
				.map((x) => x.charCodeAt(0)),
		);
		return thumbHashToDataURL(binary);
	});

	const [dimensions, setDimensions] = useState({ height, width });
	const imgRef: RefCallback<HTMLImageElement> = useCallback((ref) => {
		if (!ref) {
			return;
		}
		setDimensions((prev) => {
			if (prev.height && prev.width) {
				return prev;
			}
			return {
				// Set if the values are above zero, otherwise leave it undefined.
				height:
					Math.ceil(
						max(ref.parentElement?.offsetHeight, ref.offsetHeight) *
							window.devicePixelRatio,
					) || undefined,
				width:
					Math.ceil(
						max(ref.parentElement?.offsetWidth, ref.offsetWidth) *
							window.devicePixelRatio,
					) || undefined,
			};
		});
	}, []);

	const { data } = useQuery(
		trpc.photos.get.queryOptions({
			id: photo.id,
			resizing_type: fit,
			...dimensions,
		}),
	);
	useEffect(() => {
		if (data) {
			setUrl(data.url);
		}
	}, [data]);

	return (
		<img
			{...props}
			alt={alt}
			height={height}
			ref={imgRef}
			src={url}
			width={width}
		/>
	);
}

function max(...numbers: unknown[]) {
	return Math.max(...numbers.filter((n) => typeof n === 'number'), 0);
}
