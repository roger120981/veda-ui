# Delta
TODO: Description

## Installation and Usage
The steps below will walk you through setting up your own instance of the project. 

### Install Project Dependencies
To set up the development environment for this website, you'll need to install the following on your system:

- [Node](http://nodejs.org/) v16 (To manage multiple node versions we recommend [nvm](https://github.com/creationix/nvm))
- [Yarn](https://yarnpkg.com/) Package manager

### Install Application Dependencies

If you use [`nvm`](https://github.com/creationix/nvm), activate the desired Node version:

```
nvm install
```

Install Node modules:

```
yarn install
```

### Usage

#### Config files
Configuration is done using [dot.env](https://parceljs.org/features/node-emulation/#.env-files) files.

These files are used to simplify the configuration of the app and should not contain sensitive information.

#### Mapbox Token

Get your Mapbox access token from Mapbox Dashboard. Put the key in `.env.local-sample` file. Copy the file and rename as `.env.local`.

#### Starting the app

```
yarn serve
```
Compiles the sass files, javascript, and launches the server making the site available at `http://localhost:9000/`
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with livereload.

### Development doc
Refer to [DEVELOPMENT](https://github.com/NASA-IMPACT/delta-ui/blob/main/DEVELOPMENT.md) docs to read about architecture.

# Deployment
To prepare the app for deployment run:

```
yarn build
```
or
```
yarn stage
```
This will package the app and place all the contents in the `dist` directory.
The app can then be run by any web server.

**When building the site for deployment provide the base url trough the `PUBLIC_URL` environment variable. Omit the leading slash. (E.g. https://example.com)**

If you want to use any other parcel feature it is also possible. Example:
```
PARCEL_BUNDLE_ANALYZER=true yarn parcel build app/index.html
```