import { useForeignRefs } from "~/index.js";
import type * as schemas from '../models/$schemas.js'

export const { foreignRef, virtualForeignRef } = useForeignRefs<typeof schemas>();
