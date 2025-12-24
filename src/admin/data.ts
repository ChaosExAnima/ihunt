import { isTRPCClientError } from '@trpc/client';
import { AuthProvider, DataProvider } from 'react-admin';

import { trpcPlain } from '@/lib/api';
import { adminAuthSchema } from '@/lib/schemas';

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
		const result = await trpcPlain.admin.create.mutate({
			data: data,
			resource,
		});
		return { data: result };
	},
	// delete a record by id
	async delete(resource, params) {
		const result = await trpcPlain.admin.delete.mutate({
			id: params.id,
			resource,
		});
		return { data: result };
	},
	// delete a list of records based on an array of ids
	async deleteMany(resource, params) {
		return trpcPlain.admin.deleteMany.mutate({
			ids: params.ids,
			resource,
		});
	},
	// get a list of records based on sort, filter, and pagination
	async getList(resource, params) {
		const result = await trpcPlain.admin.getList.query({
			resource,
			...params,
		});
		return result;
	},
	// get a list of records based on an array of ids
	async getMany(resource, params) {
		const result = await trpcPlain.admin.getList.query({
			resource,
			...params,
		});
		return result;
	},
	// get the records referenced to another record, e.g. comments for a post
	async getManyReference(resource, params) {
		const result = await trpcPlain.admin.getReferences.query({
			resource,
			...params,
		});
		return result;
	},
	// get a single record by id
	async getOne(resource, params) {
		const result = await trpcPlain.admin.getOne.query({
			id: params.id,
			resource,
		});
		return { data: result };
	},
	// update a record based on a patch
	async update(resource, params) {
		const result = await trpcPlain.admin.updateOne.mutate({
			data: params.data,
			resource,
		});
		return {
			data: result,
		};
	},
	// update a list of records based on an array of ids and a common patch
	async updateMany(resource, params) {},
} satisfies DataProvider<Resources>;
