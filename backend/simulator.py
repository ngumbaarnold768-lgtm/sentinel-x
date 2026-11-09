import socket
import time
import sys

TARGET_IP = "127.0.0.1"
TARGET_PORT = 8080

def send_normal_traffic():
    print("[*] Starting Normal Traffic Simulation...")
    while True:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1)
            s.connect((TARGET_IP, TARGET_PORT))
            s.send(b"GET / HTTP/1.1\r\nHost: localhost\r\n\r\n")
            s.close()
        except Exception:
            pass
        time.sleep(1)

def send_simulated_flood():
    print("[!] Starting Simulated Traffic Spike...")
    for _ in range(500):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.1)
            s.connect((TARGET_IP, TARGET_PORT))
            s.send(b"GET / HTTP/1.1\r\nHost: localhost\r\n\r\n")
            s.close()
        except Exception:
            pass
    print("[*] Spike completed.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "spike":
        send_simulated_flood()
    else:
        send_normal_traffic()