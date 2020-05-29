

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

We are using [Node.js][node] v10.x. We recommend using a tool such as [asdf][asdf]
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

If you default browser is not compatible (i.e. not chromium), create a file
`.env.local` in the root directory with the full path to the browser:

    BROWSER=<path-to-chromium>

The page will reload if you make edits.

You will also see any lint errors in the console.


### `yarn lint`

Runs the code linter.

This will automatically fix most lint errors for you.


### `yarn test`

Launches the test runner in the interactive watch mode.

See the section about [running tests][tests] for more information.

[tests]: https://facebook.github.io/create-react-app/docs/running-tests


### `yarn build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the
best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

See the section about [deployment][deployment] for more information.

[deployment]: https://facebook.github.io/create-react-app/docs/deployment


## Learn More

You can learn more in the [Create React App documentation][create-react-app-doc].

[create-react-app-doc]: https://facebook.github.io/create-react-app/docs/getting-started

To learn React, check out the [React documentation](https://reactjs.org/).

To learn React Redux, check out the [React Redux documentation](https://react-redux.js.org/)

To learn Redux-Saga, checkout the [Redux-Saga documentation](https://redux-saga.js.org/)
