import { createPackageBuilder } from "lionconfig";

await createPackageBuilder(import.meta, {
  packageJsonPath: "../package.json",
  tsconfigPath: "../tsconfig.build.json",
})
  .cleanDistFolder()
  .tsc()
  .generateBundles({ commonjs: false, typeDefinitions: true })
  .copyPackageFiles()
  .build();
