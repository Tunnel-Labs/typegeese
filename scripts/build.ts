import { createPackageBuilder } from "lionconfig";

await createPackageBuilder(import.meta, {
  packageJsonPath: "../package.json",
})
  .cleanDistFolder()
  .tsc()
  .generateBundles({ commonjs: false })
  .copyPackageFiles()
  .build();
