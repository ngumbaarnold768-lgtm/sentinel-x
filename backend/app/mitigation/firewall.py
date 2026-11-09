import subprocess
import platform
import logging

logger = logging.getLogger("sentinel_x.mitigation")

class FirewallAdapter:
    def __init__(self, dry_run=True):
        self.dry_run = dry_run
        self.chain_name = "SENTINEL_X"
        if platform.system() == "Linux" and not self.dry_run:
            self._initialize_chain()

    def _run_command(self, cmd_list):
        if self.dry_run:
            logger.info(f"[DRY-RUN] Would execute: {' '.join(cmd_list)}")
            return True
        try:
            subprocess.run(cmd_list, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info(f"Executed: {' '.join(cmd_list)}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Command failed: {' '.join(cmd_list)} | {e.stderr.decode().strip()}")
            return False

    def _initialize_chain(self):
        subprocess.run(["iptables", "-N", self.chain_name], stderr=subprocess.DEVNULL)
        check_link = subprocess.run(["iptables", "-C", "INPUT", "-j", self.chain_name], stderr=subprocess.PIPE)
        if check_link.returncode != 0:
            self._run_command(["iptables", "-I", "INPUT", "-j", self.chain_name])

    def block_ip(self, ip_address, reason="DDoS_Mitigation"):
        return self._run_command(["iptables", "-A", self.chain_name, "-s", ip_address, "-j", "DROP"])

    def unblock_ip(self, ip_address):
        return self._run_command(["iptables", "-D", self.chain_name, "-s", ip_address, "-j", "DROP"])

    def flush_all_rules(self):
        return self._run_command(["iptables", "-F", self.chain_name])

class MockFirewall(FirewallAdapter):
    def _run_command(self, cmd_list):
        logger.info(f"[MOCK FIREWALL] Simulated: {' '.join(cmd_list)}")
        return True