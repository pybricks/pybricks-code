#!/usr/bin/env python3

"""
Serve the build directory using builtin Python web server.
"""

import http.server
import pathlib
import socketserver

BUILD_DIR = (pathlib.Path(__file__).parent.parent / "build").resolve()
PORT = 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(
        self,
        request: bytes,
        client_address: tuple[str, int],
        server: socketserver.BaseServer,
        directory: str | None = ...
    ) -> None:
        super().__init__(request, client_address, server, directory=BUILD_DIR)

    def end_headers(self) -> None:
        # custom headers needed for some web API features
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        return super().end_headers()


with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"serving at http://0.0.0.0:{PORT}")
    httpd.serve_forever()
