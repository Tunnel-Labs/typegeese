/**
	Try to convert input "value" to a String, without it failing
	@param value The Value to convert to String
	@returns A String, either "value.toString" or a placeholder
*/
export function toStringNoFail(value: unknown): string {
  try {
    return String(value);
  } catch (_) {
    return '(Error: Converting value to String failed)';
  }
}