import type { VirtualOptions } from '@-/types';
import { virtualOptions } from '../constants/options.js';

/**
	Check if the "options" contain any Virtual-Populate related options (excluding "ref" by it self)
	@param options The raw Options
*/
export function isWithVirtualPOP(options: Partial<VirtualOptions>): boolean {
	return Object.keys(options).some((v) => virtualOptions.includes(v));
}
