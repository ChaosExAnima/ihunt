/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	createTRPCClient,
	httpBatchLink,
	httpLink,
	isNonJsonSerializable,
	isTRPCClientError,
	loggerLink,
	splitLink,
} from '@trpc/client';
import { AuthProvider, DataProvider, useDataProvider } from 'react-admin';
import superjson from 'superjson';

import { AppRouter } from '@/server/index';

import { adminAuthSchema } from './schemas';
import { adminCreateInput } from './schemas';

const url = '/trpc';
const trpc = createTRPCClient<AppRouter>({
	links: [
		loggerLink({
			enabled: () => !!localStorage.getItem('debugApi'),
		}),
		splitLink({
			condition: (op) => isNonJsonSerializable(op.input),
			false: httpBatchLink({
				transformer: superjson,
				url,
			}),
			true: httpLink({ transformer: superjson, url }),
		}),
	],
});

export const authProvider = {
	// when the user navigates, make sure that their credentials are still valid
	async checkAuth() {
		try {
			await trpc.admin.isValid.query();
		} catch (err) {
			if (isTRPCClientError(err)) {
				throw new Error();
			}
		}
	},
	// when the dataProvider returns an error, check if this is an authentication error
	// eslint-disable-next-line @typescript-eslint/require-await
	async checkError(error) {
		if (isTRPCClientError(error)) {
			if (error.message === 'UNAUTHORIZED') {
				throw new Error();
			}
		}
	},

	// send username and password to the auth server and get back credentials
	async login(params) {
		const input = adminAuthSchema.parse(params);
		const response = await trpc.auth.adminLogin.mutate(input);
		if (!response?.success) {
			throw new Error('Could not log in');
		}
	},
	// remove local credentials and notify the auth server that the user logged out
	async logout() {
		await trpc.auth.logOut.mutate();
	},
} satisfies AuthProvider;

type Resources = 'hunt' | 'hunter' | 'photo' | 'user';

export const dataProvider = {
	// create a record
	async create(resource, { data }) {
		if (resource === 'photo') {
			throw new Error('Cannot create a photo');
		}
		const input = adminCreateInput.parse({ data, resource });
		const result = await trpc.admin.create.mutate(input);
		return { data: result } as { data: any };
	},
	// delete a record by id
	async delete(resource, params) {
		const result = await trpc.admin.delete.mutate({
			id: params.id,
			resource,
		});
		return { data: result } as { data: any };
	},
	// delete a list of records based on an array of ids
	async deleteMany(resource, params) {
		const result = await trpc.admin.deleteMany.mutate({
			ids: params.ids,
			resource,
		});
		return { data: result };
	},
	// get a list of records based on sort, filter, and pagination
	async getList(resource, params) {
		const { data, total } = await trpc.admin.getList.query({
			resource,
			...params.pagination,
			filter: params.filter,
			sort: params.sort,
		});
		return { data: data as any, total };
	},
	// get a list of records based on an array of ids
	async getMany(resource, params) {
		const { data, total } = await trpc.admin.getList.query({
			resource,
			...params,
		});
		return { data: data as any, total };
	},
	// get the records referenced to another record, e.g. comments for a post
	async getManyReference(resource, params) {
		const { data, total } = await trpc.admin.getReferences.query({
			resource,
			...params,
		});
		return { data: data as any, total };
	},
	// get a single record by id
	async getOne(resource, params) {
		const result = await trpc.admin.getOne.query({
			id: params.id,
			resource,
		});
		return { data: result as any };
	},

	// Send message to players
	async message(params: { body?: string; ids: number[]; title: string }) {
		const result = await trpc.notify.message.mutate(params);
		return result;
	},

	// update a record based on a patch
	async update(resource, params) {
		const result = await trpc.admin.updateOne.mutate({
			data: params.data,
			id: params.id,
			resource,
		});
		return {
			data: result as any,
		};
	},

	// update a list of records based on an array of ids and a common patch
	async updateMany(resource, params) {
		const result = await trpc.admin.updateMany.mutate({
			data: params.data,
			ids: params.ids,
			resource,
		});
		return { data: result.ids };
	},

	async uploadPhoto(params: AdminUploadPhotoArgs) {
		const { blob } = params;
		const formData = new FormData();
		formData.append('photo', blob);
		if (params.hunterId) {
			formData.append('hunterId', params.hunterId.toString());
		}
		if (params.huntId) {
			formData.append('huntId', params.huntId.toString());
		}

		return trpc.photos.upload.mutate(formData);
	},
} satisfies DataProvider<Resources>;

export type AdminDataProvider = DataProvider & typeof dataProvider;

export const useTypedDataProvider = () => useDataProvider<AdminDataProvider>();

export type AdminUploadPhotoArgs = {
	blob: Blob;
	hunterId?: number;
	huntId?: number;
};
