import { isTRPCClientError } from '@trpc/client';
import { AuthProvider, DataProvider } from 'react-admin';

import { queryClient, trpc, trpcMutate } from '@/lib/api';
import { adminAuthSchema } from '@/lib/schemas';

export const authProvider = {
	// when the user navigates, make sure that their credentials are still valid
	async checkAuth() {
		try {
			await queryClient.fetchQuery(trpc.auth.isAdmin.queryOptions());
		} catch (err) {
			await this.checkError(err);
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
		const response = await trpcMutate(trpc.auth.adminLogin, input);
		if (!response?.success) {
			throw new Error('Could not log in');
		}
	},
	// remove local credentials and notify the auth server that the user logged out
	async logout() {
		await trpcMutate(trpc.auth.logOut);
	},
} satisfies AuthProvider;

type Resources = 'hunt' | 'hunter' | 'photo' | 'user';

export const dataProvider = {
	// create a record
	async create(resource, params) {
		switch (resource) {
			case 'hunt':
				return await trpcMutate(trpc.hunt, params);
			case 'hunter':
				return trpcMutate(trpc.hunter, params);
			case 'user':
				return trpcMutate(trpc, params);
		}
	},
	// delete a record by id
	async delete(resource, params) {},
	// delete a list of records based on an array of ids
	async deleteMany(resource, params) {},
	// get a list of records based on sort, filter, and pagination
	async getList(resource, params) {
		switch (resource) {
			case 'hunt':
				return queryClient.fetchQuery(
					trpc.hunt.getPublic.queryOptions(),
				);
		}
	},
	// get a list of records based on an array of ids
	async getMany(resource, params) {},
	// get the records referenced to another record, e.g. comments for a post
	async getManyReference(resource, params) {},
	// get a single record by id
	async getOne(resource, params) {},
	// update a record based on a patch
	async update(resource, params) {},
	// update a list of records based on an array of ids and a common patch
	async updateMany(resource, params) {},
} satisfies DataProvider<Resources>;
