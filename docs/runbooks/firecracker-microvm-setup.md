# Runbook: Firecracker MicroVM Hardware-Virtualized Sandbox Setup

> **Target**: Self-hosted, sovereign, sub-150ms microVM execution isolation for untrusted agent code on bare-metal or KVM-enabled Linux hosts.

---

## 1. Hardware & Kernel Prerequisites

Firecracker requires Linux KVM hardware acceleration (`/dev/kvm`). Ensure your host meets the requirements:

```bash
# 1. Verify KVM availability
sudo apt-get install -y cpu-checker
kvm-ok

# Expected output:
# INFO: /dev/kvm exists
# KVM acceleration can be used

# 2. Grant read/write permissions to current user
sudo usermod -aG kvm "$USER"
sudo chmod 660 /dev/kvm
```

---

## 2. Install Firecracker Binary

Download and install the official Firecracker v1.7+ release:

```bash
FIRECRACKER_VERSION="v1.7.0"
ARCH="$(uname -m)"

cd /tmp
curl -LO "https://github.com/firecracker-microvm/firecracker/releases/download/${FIRECRACKER_VERSION}/firecracker-${FIRECRACKER_VERSION}-${ARCH}.tgz"
tar -xzf "firecracker-${FIRECRACKER_VERSION}-${ARCH}.tgz"

sudo mv "release-${FIRECRACKER_VERSION}-${ARCH}/firecracker-${FIRECRACKER_VERSION}-${ARCH}" /usr/local/bin/firecracker
sudo mv "release-${FIRECRACKER_VERSION}-${ARCH}/jailer-${FIRECRACKER_VERSION}-${ARCH}" /usr/local/bin/jailer
sudo chmod +x /usr/local/bin/firecracker /usr/local/bin/jailer

# Verify version
firecracker --version
```

---

## 3. Prepare Sovereign Linux Kernel & RootFS

Firecracker requires an uncompressed Linux kernel (`vmlinux`) and an ext4 root filesystem image:

```bash
# Create dedicated storage directory
sudo mkdir -p /var/lib/firecracker
sudo chown -R "$USER:$USER" /var/lib/firecracker

# Download minimal CI kernel and Ubuntu rootfs
cd /var/lib/firecracker

# Kernel image
curl -fsSL -o vmlinux "https://s3.amazonaws.com/spec.ccfc.min/firecracker-ci/v1.7/${ARCH}/vmlinux-5.10.198"

# Root filesystem
curl -fsSL -o rootfs.ext4 "https://s3.amazonaws.com/spec.ccfc.min/firecracker-ci/v1.7/${ARCH}/ubuntu-22.04.ext4"

# Set read permissions
chmod 644 /var/lib/firecracker/vmlinux /var/lib/firecracker/rootfs.ext4
```

---

## 4. Configure INDEX0 Sandbox Manager Environment

In your root `.env` or `services/sandbox-manager/.env`:

```env
# Activate Firecracker provider
SANDBOX_PROVIDER=firecracker

# MicroVM Paths
FIRECRACKER_BIN=/usr/local/bin/firecracker
FIRECRACKER_KERNEL=/var/lib/firecracker/vmlinux
FIRECRACKER_ROOTFS=/var/lib/firecracker/rootfs.ext4
FIRECRACKER_SOCKET_PREFIX=/tmp/firecracker-

# Resource Allocation per MicroVM
FIRECRACKER_VCPU_COUNT=2
FIRECRACKER_MEM_SIZE_MIB=1024
```

---

## 5. Verification & Healthcheck

Start the sandbox manager service and run execution tests:

```bash
# 1. Run sandbox manager tests
pnpm --filter @index0/sandbox-manager test

# 2. Check healthcheck script
./scripts/healthcheck.sh
```

---

## 6. Fallback Matrix

If KVM is not available (e.g. inside nested VMs or non-Linux OS):
- INDEX0 automatically falls back to the **E2B Cloud SDK** (`SANDBOX_PROVIDER=e2b`) or **Docker sandbox runtime** (`SANDBOX_PROVIDER=docker`).
