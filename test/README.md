# Testing

NOTE: This directory contains test helpers. Actual tests are in the `src/`
directory.


## Running tests

    yarn test

Launches the test runner in the interactive watch mode.

See the section about [running tests][tests] for more information.

[tests]: https://facebook.github.io/create-react-app/docs/running-tests

## Code coverage

    yarn coverage

Launches the test runner in the code coverage mode. Results are displayed in
the terminal.

    yarn coverage:html
    xdg-open coverage/index.html

Does the same thing except results are converted to more detailed html pages in
the `coverage/` directory. (On macOS, use `open` and on Windows use `explorer`
instead of `xdg-open` to open the html in your default web browser.)


## Writing tests

Tests are written using the [Jest][jest] testing framework.

[jest]: https://jestjs.io/
