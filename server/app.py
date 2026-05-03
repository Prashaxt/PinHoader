from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from pinterest_dl import PinterestDL
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
import zipfile
import requests
import re
import os
import json
import base64

app = Flask(__name__)
CORS(app)

MAX_PINS = 300
MAX_WORKERS = 10


def sanitize_filename(name):
    name = name.lower().strip()
    name = re.sub(r'[^a-z0-9_\-]', '_', name)
    name = re.sub(r'_+', '_', name)
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
    if 'png' in url.lower():
        return 'png'
    if 'gif' in url.lower():
        return 'gif'
    if 'webp' in url.lower():
        return 'webp'
    return 'jpg'


def sse(payload):
    return f"data: {json.dumps(payload)}\n\n"


@app.route('/api/downloadZip', methods=['POST'])
def download_zip():
    data = request.json
    board_url = data.get('boardUrl')
    board_name = data.get('boardName', 'pinterest_board')

    if not board_url:
        return jsonify({'error': 'Board URL is required'}), 400

    safe_filename = sanitize_filename(board_name)

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

            # Step 4 — Send as base64
            zip_b64 = base64.b64encode(zip_buffer.getvalue()).decode()

            yield sse({
                'status': 'done',
                'message': 'Done!',
                'filename': f'{safe_filename}.zip',
                'data': zip_b64
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


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)


# --------------------------------------------------------------------------------------------------

# from flask import Flask, request, jsonify, send_file
# from flask_cors import CORS
# from pinterest_dl import PinterestDL
# from io import BytesIO
# import zipfile
# import requests
# import re
# import os

# app = Flask(__name__)
# CORS(app)

# MAX_PINS = 300

# def sanitize_filename(name):
#     """Convert board name to safe filename."""
#     name = name.lower().strip()
#     name = re.sub(r'[^a-z0-9_\-]', '_', name)
#     name = re.sub(r'_+', '_', name)  # collapse multiple underscores
#     return name or 'pinterest_board'

# def get_image_urls(board_url, num=MAX_PINS):
#     """Scrape image URLs using pinterest-dl API mode — no browser needed."""
#     scraped = PinterestDL.with_api(
#         timeout=10,
#         verbose=False,
#     ).scrape(
#         url=board_url,
#         num=num,
#     )

#     urls = []
#     for media in scraped:
#         d = media.to_dict()
#         src = d.get('src', '')
#         if src:
#             # src is already full resolution (orig), but fallback to 736x if needed
#             urls.append(src)

#     return urls


# @app.route('/api/downloadZip', methods=['POST'])
# def download_zip():
#     data = request.json
#     board_url = data.get('boardUrl')
#     board_name = data.get('boardName', 'pinterest_board')

#     if not board_url:
#         return jsonify({'error': 'Board URL is required'}), 400

#     safe_filename = sanitize_filename(board_name)
#     zip_filename = f'{safe_filename}.zip'

#     print(f"Starting download for: {board_url}")
#     print(f"Zip filename: {zip_filename}")

#     try:
#         # Step 1: Scrape image URLs using pinterest-dl
#         print("Scraping image URLs...")
#         image_urls = get_image_urls(board_url, num=MAX_PINS)
#         print(f"Found {len(image_urls)} images")

#         if not image_urls:
#             return jsonify({'error': 'No images found for this board'}), 404

#         # Step 2: Download images and zip them in memory
#         zip_buffer = BytesIO()

#         with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
#             for idx, image_url in enumerate(image_urls):
#                 try:
#                     response = requests.get(image_url, timeout=10)

#                     if response.status_code == 200:
#                         # Determine file extension from URL or content type
#                         content_type = response.headers.get('Content-Type', '')
#                         if 'png' in image_url.lower() or 'png' in content_type:
#                             ext = 'png'
#                         elif 'gif' in image_url.lower() or 'gif' in content_type:
#                             ext = 'gif'
#                         elif 'webp' in image_url.lower() or 'webp' in content_type:
#                             ext = 'webp'
#                         else:
#                             ext = 'jpg'

#                         filename = f'pin_{idx + 1:03d}.{ext}'
#                         zip_file.writestr(filename, response.content)
#                         print(f"Added {filename} ({idx + 1}/{len(image_urls)})")

#                     elif response.status_code == 403:
#                         # Try fallback to 736x if original fails
#                         fallback_url = re.sub(r'/originals/', '/736x/', image_url)
#                         if fallback_url != image_url:
#                             fb_res = requests.get(fallback_url, timeout=10)
#                             if fb_res.status_code == 200:
#                                 zip_file.writestr(f'pin_{idx + 1:03d}.jpg', fb_res.content)
#                                 print(f"Added pin_{idx + 1:03d}.jpg via fallback")

#                 except Exception as e:
#                     print(f"Skipped image {idx + 1}: {e}")
#                     continue

#         zip_buffer.seek(0)

#         return send_file(
#             zip_buffer,
#             mimetype='application/zip',
#             as_attachment=True,
#             download_name=zip_filename
#         )

#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({'error': 'Failed to create zip file'}), 500


# @app.route('/health', methods=['GET'])
# def health():
#     return jsonify({'status': 'ok'})


# if __name__ == '__main__':
#     port = int(os.environ.get('PORT', 5000))
#     app.run(host='0.0.0.0', port=port, debug=False)