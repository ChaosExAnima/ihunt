import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';

import { ActionButton } from '@/components/action-button';
import { BackButton } from '@/components/back-button';
import { Header } from '@/components/header';
import { apiDebug, trpc } from '@/lib/api';

export const Route = createFileRoute('/debug')({
	component: RouteComponent,
});

const none = <em className="text-muted">None</em>;

function RouteComponent() {
	const { data } = useQuery(trpc.auth.me.queryOptions());
	const { lanServer, lanWorking } = apiDebug();

	const { queryClient } = Route.useRouteContext();
	const { isPending: loggingOut, mutate: logOut } = useMutation(
		trpc.auth.logOut.mutationOptions({
			onSuccess() {
				queryClient.removeQueries({ queryKey: trpc.auth.pathKey() });
			},
		}),
	);
	const handleLogOut = useCallback(() => {
		logOut();
	}, [logOut]);

	const [assetCacheSize, setAssetCacheSize] = useState<number>();
	const [imageCacheSize, setImageCacheSize] = useState<number>();
	useEffect(() => {
		void getCachesSizes().then((sizes) => {
			setAssetCacheSize(sizes['assets']);
			setImageCacheSize(sizes['images']);
		});
	}, []);

	const [cachePending, setCachePending] = useState(false);
	const handleClearCaches = useCallback(() => {
		if (cachePending) {
			return;
		}
		setCachePending(true);
		void clearAllCaches().then(async () => {
			setCachePending(false);

			const sizes = await getCachesSizes();
			setAssetCacheSize(sizes['assets']);
			setImageCacheSize(sizes['images']);
		});
	}, [cachePending]);

	return (
		<main className="flex grow flex-col gap-4 p-4">
			<Header>Debug information</Header>
			<ul className="grow">
				<li>Build: {window.__IHUNT_VERSION__ ?? 'Unknown'}</li>
				<li>LAN Server: {lanServer ?? none}</li>
				<li>LAN Active: {lanWorking ? 'Yes' : 'No'}</li>
				<li>Hunter ID: {data?.hunter.id ?? none}</li>
				<li>Asset cache size: {assetCacheSize ?? none}</li>
				<li>Image cache size: {imageCacheSize ?? none}</li>
			</ul>
			{(assetCacheSize || imageCacheSize) && (
				<ActionButton
					variant="destructive"
					updating={cachePending}
					onClick={handleClearCaches}
				>
					Clear app caches
				</ActionButton>
			)}
			{data && (
				<ActionButton
					variant="destructive"
					updating={loggingOut}
					onClick={handleLogOut}
				>
					Log out
				</ActionButton>
			)}
			<BackButton />
		</main>
	);
}

async function getCachesSizes() {
	const list = await caches.keys();
	const cacheMap: Record<string, number> = {};
	for (const name of list) {
		const cache = await caches.open(name);
		const keys = await cache.keys();
		cacheMap[name.includes('precache') ? 'assets' : name] = keys.length;
	}
	return cacheMap;
}

async function clearAllCaches() {
	const list = await caches.keys();
	for (const name of list) {
		if (name === 'images' || name.includes('precache')) {
			await caches.delete(name);
		}
	}
}
