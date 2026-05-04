from flask import Flask, request, jsonify, Response, send_file
from flask_cors import CORS
from pinterest_dl import PinterestDL
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
import zipfile
import requests
import re
import os
import json
import uuid
import threading
import time
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)

MAX_PINS = 300
MAX_WORKERS = 10

# Temporary in-memory zip storage { download_id: { data, filename } }
zip_storage = {}


def sanitize_filename(name):
    name = name.lower().strip()
    name = re.sub(r'[^a-z0-9_\-]', '_', name)
    name = re.sub(r'_+', '_', name)
    name = name.strip('_')
    return name or 'pinterest_board'


def get_image_urls(board_url, num=MAX_PINS):
    scraped = PinterestDL.with_api(
        timeout=10,
        verbose=False,
    ).scrape(
        url=board_url,
        num=num,
    )
    urls = []
    for media in scraped:
        d = media.to_dict()
        src = d.get('src', '')
        if src:
            urls.append(src)
    return urls


def download_image(args):
    idx, url = args
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            return idx, res.content, url

        # fallback to 736x if original fails
        fallback = re.sub(r'/originals/', '/736x/', url)
        if fallback != url:
            res = requests.get(fallback, timeout=10)
            if res.status_code == 200:
                return idx, res.content, fallback

    except Exception as e:
        print(f"Failed to download image {idx + 1}: {e}")

    return idx, None, url


def get_ext(url):
    path = urlparse(url).path
    ext = os.path.splitext(path)[1].lstrip('.').lower()
    return ext if ext in ('jpg', 'jpeg', 'png', 'gif', 'webp') else 'jpg'


def sse(payload):
    return f"data: {json.dumps(payload)}\n\n"

def cleanup_zip(download_id, delay=300):
    """Delete zip from memory after delay seconds if not downloaded"""
    def _cleanup():
        time.sleep(delay)
        if download_id in zip_storage:
            del zip_storage[download_id]
            print(f"Cleaned up orphaned zip: {download_id}")
    threading.Thread(target=_cleanup, daemon=True).start()


@app.route('/api/downloadZip', methods=['POST'])
def download_zip():
    data = request.json
    board_url = data.get('boardUrl')
    board_name = data.get('boardName', 'pinterest_board')
    board_owner = data.get('boardOwner', '')

    if not board_url:
        return jsonify({'error': 'Board URL is required'}), 400

    raw_filename = f"{board_name}_{board_owner}" if board_owner else board_name
    safe_filename = sanitize_filename(raw_filename)
    download_id = str(uuid.uuid4())

    def generate():
        try:
            # Step 1 — Scrape image URLs
            yield sse({'status': 'scraping', 'message': 'Finding pins...'})

            image_urls = get_image_urls(board_url, num=MAX_PINS)
            total = len(image_urls)

            if not image_urls:
                yield sse({'status': 'error', 'message': 'No images found for this board.'})
                return

            yield sse({
                'status': 'downloading',
                'message': f'Found {total} pins, downloading...',
                'current': 0,
                'total': total
            })

            # Step 2 — Download images in parallel
            results = {}
            completed = 0

            with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
                futures = {
                    executor.submit(download_image, (idx, url)): idx
                    for idx, url in enumerate(image_urls)
                }
                for future in as_completed(futures):
                    idx, content, url = future.result()
                    if content:
                        results[idx] = (content, url)
                    completed += 1
                    yield sse({
                        'status': 'downloading',
                        'message': f'Downloading {completed}/{total} pins...',
                        'current': completed,
                        'total': total
                    })

            # Step 3 — Zip everything in memory
            yield sse({'status': 'zipping', 'message': 'Creating zip file...'})

            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for idx in sorted(results.keys()):
                    content, url = results[idx]
                    ext = get_ext(url)
                    zip_file.writestr(f'pin_{idx + 1:03d}.{ext}', content)

            # Step 4 — Store zip with unique ID, send only the ID via SSE
            zip_storage[download_id] = {
                'data': zip_buffer.getvalue(),
                'filename': f'{safe_filename}.zip'
            }
            
            cleanup_zip(download_id, delay=120)

            print(f"Zip ready: {safe_filename}.zip ({len(zip_buffer.getvalue())} bytes)")

            yield sse({
                'status': 'done',
                'message': 'Done!',
                'downloadId': download_id,
                'filename': f'{safe_filename}.zip'
            })

        except Exception as e:
            print(f"Error: {e}")
            yield sse({'status': 'error', 'message': 'Something went wrong. Please try again.'})

    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'
        }
    )


@app.route('/api/getZip/<download_id>', methods=['GET'])
def get_zip(download_id):
    """Instantly serve the already-zipped file by its unique ID"""
    if download_id not in zip_storage:
        return jsonify({'error': 'File not found or already downloaded'}), 404

    zip_data = zip_storage.pop(download_id)  # remove after serving ,no memory leak

    return send_file(
        BytesIO(zip_data['data']),
        mimetype='application/zip',
        as_attachment=True,
        download_name=zip_data['filename']
    )


@app.route('/api/resolveUrl', methods=['POST'])
def resolve_url():
    data = request.json
    short_url = data.get('url')

    try:
        res = requests.head(short_url, allow_redirects=True, timeout=10)
        real_url = res.url

        if 'pinterest' not in real_url:
            return jsonify({'error': 'Not a Pinterest URL'}), 400

        return jsonify({'resolvedUrl': real_url})
    except:
        return jsonify({'error': 'Could not resolve URL'}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)