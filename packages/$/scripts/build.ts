import fs from 'node:fs';
import { createPackageBuilder } from 'lionconfig';

await createPackageBuilder(import.meta, {
	packageJsonPath: '../package.json',
	tsconfigPath: '../tsconfig.build.json'
})
	.cleanDistFolder()
	.tsc()
	.generateBundles({ commonjs: false, typeDefinitions: true })
	.copyPackageFiles()
	.run(() => {
		const distPackageJson = JSON.parse(
			fs.readFileSync('dist/package.json', 'utf8')
		);
		distPackageJson.dependencies['@typegeese/types'] = distPackageJson.version;
		fs.writeFileSync(
			'dist/package.json',
			JSON.stringify(distPackageJson, null, '\t')
		);
	})
	.build();
