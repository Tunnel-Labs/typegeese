import { type DocumentType, pre } from '@typegoose/typegoose';
import type { Promisable } from 'type-fest';
import type { Deprecated } from '../types/deprecated.js';

type Diff<T, V> = {
	[P in Exclude<keyof T, keyof V>]: T[P];
};

// prettier-ignore
type IsSupersetKey<
	PreviousModel,
	CurrentModel,
	Key extends keyof CurrentModel
> =
	Key extends '_version'
		? true
		: Key extends keyof PreviousModel
			? CurrentModel[Key] extends Deprecated<infer T>
				? T extends PreviousModel[Key]
					? true
					: false
				: CurrentModel[Key] extends PreviousModel[Key]
				? true
				: false
			: true;

type NonSupersetKeys<PreviousModel, CurrentModel> = keyof {
	[K in keyof CurrentModel as IsSupersetKey<
		PreviousModel,
		CurrentModel,
		K
	> extends false
		? K
		: never]: true;
};

interface NotSupersetError<Message, _Keys> {
	'Not a superset:': Message;
}

// prettier-ignore
type Migrations<PreviousModel, CurrentModel> = NonSupersetKeys<PreviousModel, CurrentModel> extends never
	? {
			[K in keyof Diff<CurrentModel, PreviousModel>]: (
				this: DocumentType<CurrentModel>
			) => Promisable<CurrentModel[K]>;
	  }
	: NotSupersetError<'The current model must be a superset of the previous model in order to be backwards-compatible; the following keys are incompatible:', NonSupersetKeys<PreviousModel, CurrentModel>>

export function defineMigration<PreviousModel, CurrentModel>(
	migrations: Migrations<PreviousModel, CurrentModel>
): ClassDecorator {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- will be `null` for v0
	if (migrations === null) {
		return () => {
			/* noop */
		};
	}

	// eslint-disable-next-line @typescript-eslint/ban-types -- Type of `ClassDecorator`
	return <TFunction extends Function>(c: TFunction) => {
		// When reading an older model from the database, we need to set the newly added properties to their default values
		pre('validate', async function () {
			for (const [property, getProperty] of Object.entries(migrations)) {
				if ((this as any)[property] === undefined) {
					// eslint-disable-next-line no-await-in-loop -- We set properties one at a time to avoid race conditions
					(this as any)[property] = await getProperty(this);
				}
			}
		});

		return c;
	};
}
