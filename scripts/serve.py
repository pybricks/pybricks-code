#!/usr/bin/env python3

"""
Serve the build directory using builtin Python web server.
"""

import http.server
import pathlib
import ssl

BUILD_DIR = (pathlib.Path(__file__).parent.parent / "build").resolve()
CERT_FILE = BUILD_DIR / "cert.pem"
KEY_FILE = BUILD_DIR / "key.pem"
PORT = 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(
        self,
        request: bytes,
        client_address: tuple[str, int],
        server: http.server.HTTPServer,
        directory: str | None = ...
    ) -> None:
        super().__init__(request, client_address, server, directory=str(BUILD_DIR))

    def end_headers(self) -> None:
        # custom headers needed for some web API features
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        return super().end_headers()


httpd = http.server.HTTPServer(("", PORT), Handler)

if CERT_FILE.exists() and KEY_FILE.exists():
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)
    httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)
    print(f"serving at https://0.0.0.0:{PORT}")
else:
    print(f"cert/key not found, serving without TLS at http://0.0.0.0:{PORT}")

httpd.serve_forever()
