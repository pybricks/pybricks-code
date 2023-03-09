

# Development Environment

These are the tools you will need to build and run `pybricks-code` locally.

## IDE

Technically you can use any text editor you like but the project is set up to
use [VS Code][vscode]. The project includes some recommended extensions that
will do nice things like automatically format the code for you.

[vscode]: https://code.visualstudio.com/

## Toolchain

These are the required software tools you need to install on your computer.

### Node.js

We are using [Node.js][node] v12.x. We recommend using a tool such as [asdf][asdf]
or [nvm][nvm] if you need to install more than one version of Node.js.

[node]: https://nodejs.org/en/
[asdf]: https://asdf-vm.com/
[nvm]: https://github.com/nvm-sh/nvm

### Yarn Package Manager

We are using [Yarn][yarn] 1.x for package management.

[yarn]: https://classic.yarnpkg.com/

### Git Version Control

You will need [Git][git] to get the source code from GitHub. (Say that 3 times fast!)

[git]: https://git-scm.com/

## Getting The Code

After the tools above have been installed, open a command prompt in the directory
where you would like to save the source code and run:

    git clone https://github.com/pybricks/pybricks-code
    cd pybricks-code
    yarn install

# Software Stack

This project was bootstrapped with [Create React App][create-react-app].

[create-react-app]: https://github.com/facebook/create-react-app

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

If your default browser is not compatible (i.e. not chromium), create a file
`.env.local` in the root directory with the full path to the browser:

    BROWSER=<path-to-chromium>

The page will reload if you make edits.

You will also see any lint errors in the console.

### `yarn lint`

Runs the code linter.

This will automatically fix most lint errors for you.

### `yarn test`

See [README](test/README.md) in the `test/` directory.

### `yarn build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the
best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

See the section about [deployment][deployment] for more information.

[deployment]: https://facebook.github.io/create-react-app/docs/deployment


## Running the app locally

For most development work, running `yarn start` will suffice (see above).
However, there are some features, like the service worker, that are disabled in
this environment. To test the site as if it was deployed in production, we can
serve up the output of `yarn build` instead.

This app uses "powerful web features" so requires a secure (https) connection.
So for local testing without https, we need to follow
<https://www.chromium.org/Home/chromium-security/deprecating-powerful-features-on-insecure-origins/#testing-powerful-features>.

To serve the website, run:

    yarn build
    ./scripts/serve.py

Note: the usual `npx serve` doesn't properly serve parts of the site so we use
a custom Python script instead.

Then at `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, add:

    http://localhost:8000

and restart Chromium.

The first link above also has info on how to use port forwarding to test on
Android devices.

## Learn More

You can learn more in the [Create React App documentation][create-react-app-doc].

[create-react-app-doc]: https://facebook.github.io/create-react-app/docs/getting-started

To learn React, check out the [React documentation](https://reactjs.org/).

To learn React Redux, check out the [React Redux documentation](https://react-redux.js.org/)

To learn Redux-Saga, checkout the [Redux-Saga documentation](https://redux-saga.js.org/)
