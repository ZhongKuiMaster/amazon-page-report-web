#!/usr/bin/env python3
import ssl
import sys
import urllib.request


def main():
    if len(sys.argv) < 2:
        raise SystemExit("missing url")

    url = sys.argv[1]
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
        },
    )
    with urllib.request.urlopen(
        req,
        timeout=25,
        context=ssl._create_unverified_context(),
    ) as response:
        html = response.read().decode("utf-8", "ignore")
    sys.stdout.write(html)


if __name__ == "__main__":
    main()
