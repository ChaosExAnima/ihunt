import { z } from 'zod';

export enum HuntStatus {
	Active = 'active',
	Available = 'available',
	Cancelled = 'cancelled',
	Complete = 'complete',
	Pending = 'pending',
}

export const huntStatusNames: Record<HuntStatus, string> = {
	[HuntStatus.Active]: 'Active',
	[HuntStatus.Available]: 'Available',
	[HuntStatus.Cancelled]: 'Cancelled',
	[HuntStatus.Complete]: 'Complete',
	[HuntStatus.Pending]: 'Pending',
};

export const huntStatus = z.nativeEnum(HuntStatus).default(HuntStatus.Pending);
