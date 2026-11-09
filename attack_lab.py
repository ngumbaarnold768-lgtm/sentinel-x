import argparse
from time import sleep
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

TARGET_URL = "http://127.0.0.1:8000/"
MAX_REQUESTS = 10
MIN_INTERVAL_SECONDS = 1.0


def check_local_service(request_count, interval):
    for request_number in range(1, request_count + 1):
        try:
            with urlopen(TARGET_URL, timeout=2) as response:
                response.read(1024)
                print(f"Check {request_number}/{request_count}: HTTP {response.status}")
        except HTTPError as error:
            print(f"Local service returned HTTP {error.code}")
            return 1
        except (URLError, TimeoutError, OSError) as error:
            print(f"Could not reach the local service: {error}")
            return 1

        if request_number < request_count:
            sleep(interval)

    return 0


def main():
    parser = argparse.ArgumentParser(
        description="Run a small, rate-limited health check against the local Sentinel-X API."
    )
    parser.add_argument(
        "--requests",
        type=int,
        choices=range(1, MAX_REQUESTS + 1),
        default=1,
        help=f"Number of sequential checks (1-{MAX_REQUESTS}; default: 1)",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=MIN_INTERVAL_SECONDS,
        help=f"Seconds between checks (minimum: {MIN_INTERVAL_SECONDS})",
    )
    args = parser.parse_args()

    if args.interval < MIN_INTERVAL_SECONDS:
        parser.error(f"--interval must be at least {MIN_INTERVAL_SECONDS} second")

    return check_local_service(args.requests, args.interval)


if __name__ == "__main__":
    raise SystemExit(main())
