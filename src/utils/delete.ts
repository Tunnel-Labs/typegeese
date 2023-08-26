import type { OnForeignModelDeletedActions } from '~/types/delete.js';

export function defineOnForeignModelDeletedActions<Model>(
	actions: OnForeignModelDeletedActions<Model>
) {
	return actions;
}
