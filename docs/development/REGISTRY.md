## Library build

As VEDA-UI is trying to become a registry, there are several things that developers need to be aware of.

### Local Development

Build locally first with the command below.
```
yarn buildlib
```

After successfully building the library, link the project to your local environment with the following command, executed inside the VEDA-UI directory:

```
yarn link 
```
Then change your directory to the project that is using veda-ui, which has `@developmentseed/veda-ui` as a dependency. Create a local alias for VEDA-UI by running:
```
yarn link @developmentseed/veda-ui
```

Your project should now use the local version of the VEDA-UI library.

### Build with pipeline

As of September 2024, VEDA-UI has two build pipelines: one for the application build (where VEDA-UI is a submodule) and one for the library build. Both pipelines are triggered whenever changes are merged into the staging or production branches. This ensures that no changes break either of the build pipelines.

Note: Package publishing is not yet part of the CI system since the library is still under active development.

### Publish

As of September 2024, VEDA-UI is being published to Development Seed's Verdaccio instance.To publish the package, authenticate using Development Seed's NPM credentials. Run the following command to test the publishing process before pushing live:

```
npm publish --dry-run
```
When the package is ready to be published, you can

```
npm publish
```

#### Version Number Discrepancy and Pre-release tags

There is currently an issue where the version number of VEDA-UI in the registry does not always match the version number of VEDA-UI when used as a submodule. Since VEDA-UI as a submodule follows a bi-weekly release schedule to support various instances, we are using pre-release tags to handle cases where additional changes need to be published without changing the version number.

For example, if the current version is v5.7.0 and further changes are necessary before the next scheduled release, the registry will use a pre-release tag like v5.7.0-alpha.x.

To check the latest version in the registry and ensure proper versioning, run:

```
npm view @developmentseed/veda-ui version
```

Currently, developers manually update the version number in the package.json file to publish with pre-release tags (instead of using npm tag) because a formal release cycle for the library has not yet been established.