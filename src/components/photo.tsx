import type { ResizingType } from '@imgproxy/imgproxy-js-core';

import { useQuery } from '@tanstack/react-query';
import {
	ImgHTMLAttributes,
	RefCallback,
	useCallback,
	useEffect,
	useState,
} from 'react';

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
	const [url, setUrl] = useState(photo.blurry ?? undefined);

	const [dimensions, setDimensions] = useState({ height, width });
	const imgRef: RefCallback<HTMLImageElement> = useCallback((ref) => {
		if (ref) {
			setDimensions((prev) => ({
				// Todo: deal with this mess
				height:
					(prev.height ||
						ref.parentElement?.offsetHeight ||
						ref.offsetHeight) * window.devicePixelRatio ||
					undefined,
				width:
					(prev.width ||
						ref.parentElement?.offsetWidth ||
						ref.offsetWidth) * window.devicePixelRatio || undefined,
			}));
		}
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
