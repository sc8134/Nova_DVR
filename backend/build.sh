#!/usr/bin/env bash
set -e

echo "=== Installing FFmpeg ==="
# Render free tier provides apt-get on the build machine
apt-get update -qq && apt-get install -y -qq ffmpeg || {
  echo "apt-get failed, trying alternative..."
  # Fallback: download static FFmpeg binary
  wget -q https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz -O /tmp/ffmpeg.tar.xz
  tar -xf /tmp/ffmpeg.tar.xz -C /tmp
  cp /tmp/ffmpeg-master-latest-linux64-gpl/bin/ffmpeg /usr/local/bin/ffmpeg
  cp /tmp/ffmpeg-master-latest-linux64-gpl/bin/ffprobe /usr/local/bin/ffprobe
  chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe
}

echo "=== FFmpeg version ==="
ffmpeg -version | head -1 || echo "FFmpeg not available"

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Build complete ==="
