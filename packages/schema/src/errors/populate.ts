/** Not All Virtual Populate Elements Error */
export class NotAllVPOPElementsError extends Error {
	constructor(name: string, key: string) {
		super(
			`"${name}.${key}" has not all needed Virtual Populate Options! Needed are: ${allVirtualoptions.join(
				', '
			)} [E006]`
		);
	}
}
