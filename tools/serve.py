#!/usr/bin/env python3

"""
Serve local build with https for testing.

This is useful, e.g. for Android (WebBluetooth doesn't work without https).

Usage:

    yarn build
    ./tools/serve.py

Browse to https://localhost:8443 on the local machine or
https://<name-or-address>:8443 on a remote device.

The browser will complain about the self-signed certificate, but this can be
bypassed (click "Advanced" in browser).
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import ssl

THIS_DIR = Path(__file__).parent
TEST_CERT = (THIS_DIR / 'test.pem').absolute()
BUILD_DIR = (THIS_DIR / '..' / 'build').absolute()

# HTTPServer serves the current directory.
os.chdir(BUILD_DIR)

httpd = HTTPServer(('', 8443), SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket, certfile=TEST_CERT, server_side=True)
httpd.serve_forever()
