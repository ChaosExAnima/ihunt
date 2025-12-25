/* eslint-disable @typescript-eslint/no-explicit-any */
import { isTRPCClientError } from '@trpc/client';
import { AuthProvider, DataProvider } from 'react-admin';

import { trpcPlain } from '@/lib/api';
import { adminAuthSchema } from '@/lib/schemas';

import { adminCreateInput } from './schemas';

export const authProvider = {
	// when the user navigates, make sure that their credentials are still valid
	async checkAuth() {
		try {
			await trpcPlain.admin.isValid.query();
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
		const response = await trpcPlain.auth.adminLogin.mutate(input);
		if (!response?.success) {
			throw new Error('Could not log in');
		}
	},
	// remove local credentials and notify the auth server that the user logged out
	async logout() {
		await trpcPlain.auth.logOut.mutate();
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
		const result = await trpcPlain.admin.create.mutate(input);
		return { data: result } as { data: any };
	},
	// delete a record by id
	async delete(resource, params) {
		const result = await trpcPlain.admin.delete.mutate({
			id: params.id,
			resource,
		});
		return { data: result } as { data: any };
	},
	// delete a list of records based on an array of ids
	async deleteMany(resource, params) {
		const result = await trpcPlain.admin.deleteMany.mutate({
			ids: params.ids,
			resource,
		});
		return { data: result };
	},
	// get a list of records based on sort, filter, and pagination
	async getList(resource, params) {
		const { data, total } = await trpcPlain.admin.getList.query({
			resource,
			...params,
		});
		return { data: data as any, total };
	},
	// get a list of records based on an array of ids
	async getMany(resource, params) {
		const { data, total } = await trpcPlain.admin.getList.query({
			resource,
			...params,
		});
		return { data: data as any, total };
	},
	// get the records referenced to another record, e.g. comments for a post
	async getManyReference(resource, params) {
		const { data, total } = await trpcPlain.admin.getReferences.query({
			resource,
			...params,
		});
		return { data: data as any, total };
	},
	// get a single record by id
	async getOne(resource, params) {
		const result = await trpcPlain.admin.getOne.query({
			id: params.id,
			resource,
		});
		return { data: result as any };
	},
	// update a record based on a patch
	async update(resource, params) {
		const result = await trpcPlain.admin.updateOne.mutate({
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
		const result = await trpcPlain.admin.updateMany.mutate({
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
		console.log('uploading:', params);

		return trpcPlain.photos.upload.mutate(formData);
	},
} satisfies DataProvider<Resources>;

export type AdminDataProvider = DataProvider & typeof dataProvider;

export type AdminUploadPhotoArgs = {
	blob: Blob;
	hunterId?: number;
	huntId?: number;
};
