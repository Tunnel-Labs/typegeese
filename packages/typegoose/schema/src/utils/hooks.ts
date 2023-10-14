import { DecoratorKeys } from '../enums/decorator-keys.js';
import { ExpectedTypeError } from '../../../errors/src/errors/type.js';
import type { HookOptionsEither, IHooksArray, Hooks } from '@-/types'
import { assertion, getName } from './internal/utils.js';
import { logger } from './logSettings.js';

// Type below is to replace a "@post<typeof Class>" to just be "@post<Class>" regardless of what is used
// see https://github.com/microsoft/TypeScript/issues/51647
// current workaround is to use "extends object" instead of something like "AnyParamConstructor" to just allow classes
// type TypeofClass<T extends { prototype: AnyParamConstructor<any> }> = T extends { prototype: infer S } ? S : never;

// TSDoc for the hooks can't be added without adding it to *every* overload
const hooks: Hooks = {
	pre(...args) {
		return (target: any) => addToHooks(target, 'pre', args);
	},
	post(...args) {
		return (target: any) => addToHooks(target, 'post', args);
	}
};

/**
	Add a hook to the hooks Array
	@param target Target Class
	@param hookType What type is it
	@param args All Arguments, that should be passed-through
*/
function addToHooks(target: any, hookType: 'pre' | 'post', args: any[]): void {
	// Convert Method to array if only a string is provided
	const methods: IHooksArray['methods'] = Array.isArray(args[0])
		? args[0]
		: [args[0]];
	const func: (...args: any[]) => void = args[1];
	const hookOptions: HookOptionsEither | undefined = args[2];

	assertion(
		typeof func === 'function',
		() => new ExpectedTypeError('fn', 'function', func)
	);

	if (args.length > 3) {
		logger.warn(
			`"addToHooks" parameter "args" has a length of over 3 (length: ${args.length})`
		);
	}

	logger.info(
		'Adding hooks for "[%s]" to "%s" as type "%s"',
		methods.join(','),
		getName(target),
		hookType
	);

	switch (hookType) {
		case 'post':
			const postHooks: IHooksArray[] = Array.from(
				Reflect.getMetadata(DecoratorKeys.HooksPost, target) ?? []
			);
			postHooks.push({ func, methods, options: hookOptions });
			Reflect.defineMetadata(DecoratorKeys.HooksPost, postHooks, target);
			break;
		case 'pre':
			const preHooks: IHooksArray[] = Array.from(
				Reflect.getMetadata(DecoratorKeys.HooksPre, target) ?? []
			);
			preHooks.push({ func, methods, options: hookOptions });
			Reflect.defineMetadata(DecoratorKeys.HooksPre, preHooks, target);
			break;
	}
}

export const pre = hooks.pre;
export const post = hooks.post;

// Export it PascalCased
export const Pre = hooks.pre;
export const Post = hooks.post;
