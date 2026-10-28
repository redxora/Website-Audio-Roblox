 
set -euo pipefail

echo "==> [1/5] Update sistem & install keamanan dasar"
apt-get update -y
apt-get install -y ca-certificates curl gnupg ufw fail2ban
dpkg-reconfigure --frontend=noninteractive unattended-upgrades || true

echo "==> [2/5] Firewall: hanya SSH yang dibuka (web lewat Cloudflare Tunnel)"
ufw allow OpenSSH
ufw --force enable

echo "==> [3/5] Install Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "==> [4/5] Install cloudflared (koneksi domain via Cloudflare Tunnel)"
if ! command -v cloudflared >/dev/null 2>&1; then
  curl -L -o /tmp/cloudflared.deb \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  dpkg -i /tmp/cloudflared.deb || apt-get install -yf
fi

echo "==> [5/5] Install yt-dlp & ffmpeg juga di host (backup kalau docker bermasalah)"
apt-get install -y python3 python3-pip ffmpeg || true
pip3 install -U yt-dlp --break-system-packages || true

cat <<'EOF'

============================================================
SETUP SELESAI. Langkah selanjutnya:

1. Upload project kamu ke VPS (dari komputer kamu):
     scp -r ./cilaa-web root@IP-VPS:/root/
   (atau git clone kalau project ada di GitHub)

2. SSH ke VPS, masuk folder project, buat file .env:
     cd /root/cilaaa-web
     nano .env          <- paste semua isi .env kamu

3. Deploy web:
     docker compose up -d --build

4. Cek web jalan:
     curl http://localhost:3000/api/health

5. Connect domain (Cloudflare Tunnel) — jalankan:
     cloudflared tunnel login
     cloudflared tunnel create cilaaa
     cloudflared tunnel route dns cilaaa cila.id
     cloudflared tunnel route dns cilaaa www.cila.id

   Lalu buat file /root/.cloudflared/config.yml :
     tunnel: <TUNNEL-ID-yang-keluar-tadi>
     credentials-file: /root/.cloudflared/<TUNNEL-ID>.json
     ingress:
       - hostname: cila.id
         service: http://localhost:3000
       - hostname: www.cila.id
         service: http://localhost:3000
       - service: http_status:404

   Install sebagai service:
     cloudflared --config /root/.cloudflared/config.yml service install
     systemctl enable --now cloudflared

6. role sync:
   App otomatis assign/cabut role Discord tanpa penjadwalan:
   - Grant saat Tako kirim payment.success (webhook).
   - Revoke saat user buka site dan langganan sudah expired (self-heal tiap page load).
   - Optional push instan: pasang Supabase Database Webhook (table subscriptions)
     -> POST https://cila.id/api/subscriptions/sync (Secret: SUPABASE_WEBHOOK_SECRET).
   Cleanup storage (file WAV kadaluarsa) jalan on-demand, bukan cron:
     curl -s -X POST http://localhost:3000/api/admin/cleanup \
       -H "Authorization: Bearer GANTI_DENGAN_TASK_SECRET"

7. Update web nanti tinggal:
     cd /root/cilaaa-web && git pull && docker compose up -d --build
============================================================
EOF
