from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import requests
from io import BytesIO
import zipfile
import re

app = Flask(__name__)
CORS(app)

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')  
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def get_board_preview(driver, board_url):
    """Get board metadata and first 8 images for preview"""
    driver.get(board_url)
    
    # Wait for page to load
    time.sleep(5)
    
    print("Looking for masonry container...")
    masonry_container = WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'div.masonryContainer[id^="boardfeed:"]'))
    )
    print("Masonry container found!")
    
    # Extract board metadata
    try:
        board_name_element = driver.find_element(By.CSS_SELECTOR, 'h1[id="board-name"]')
        board_name = board_name_element.text
        print(f"Board name: {board_name}")
    except Exception as e:
        print(f"Could not find board name: {e}")
        board_name = "Pinterest Board"
    
    try:
        pin_count_element = driver.find_element(By.CSS_SELECTOR, 'div[data-test-id="pin-count"]')
        pin_count_text = pin_count_element.text
        # Extract number from text like "123 pins"
        pin_count = int(re.search(r'\d+', pin_count_text.replace(',', '')).group())
        print(f"Pin count: {pin_count}")
    except Exception as e:
        print(f"Could not find pin count: {e}")
        pin_count = 0
    
    # Get first 8 images for preview
    seen_urls = set()
    preview_images = []
    
    imgs = masonry_container.find_elements(By.TAG_NAME, 'img')
    
    for img in imgs:
        if len(preview_images) >= 8:
            break
        
        try:
            src = img.get_attribute('src')
            if src and src not in seen_urls and 'pinimg.com' in src:
                seen_urls.add(src)
                preview_images.append(src)
        except:
            continue
    
    # Board thumbnail is the first image
    board_thumbnail = preview_images[0] if preview_images else ""
    
    # Format as pins for frontend
    pins = []
    for idx, img_url in enumerate(preview_images):
        pins.append({
            'id': f'pin-{idx+1}',
            'images': {
                '236x': {'url': img_url}
            }
        })
    
    return {
        'board': {
            'name': board_name,
            'image_thumbnail_url': board_thumbnail,
            'pin_count': pin_count
        },
        'pins': pins
    }

def scrape_all_images(driver, board_url, max_images=250):
    """Scrape all images from the board for download"""
    driver.get(board_url)
    
    # Wait for page to load
    time.sleep(5)
    
    print("Scraping all images...")
    masonry_container = WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'div.masonryContainer[id^="boardfeed:"]'))
    )
    
    # Collect unique image URLs
    seen_urls = set()
    image_urls = []
    scroll_pause_time = 2
    no_new_images_count = 0
    
    while len(image_urls) < max_images:
        # Find all img tags within masonry container
        imgs = masonry_container.find_elements(By.TAG_NAME, 'img')
        
        previous_count = len(image_urls)
        
        for img in imgs:
            if len(image_urls) >= max_images:
                break
            
            try:
                src = img.get_attribute('src')
                if src and src not in seen_urls and 'pinimg.com' in src:
                    seen_urls.add(src)
                    
                    # Convert to originals URL
                    originals_url = src.replace('/236x/', '/originals/')
                    image_urls.append(originals_url)
            except:
                continue
        
        # Check if we got new images
        if len(image_urls) == previous_count:
            no_new_images_count += 1
            if no_new_images_count >= 3:  # No new images after 3 scrolls
                break
        else:
            no_new_images_count = 0
        
        # Scroll down
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(scroll_pause_time)
    
    print(f"Total images collected: {len(image_urls)}")
    return image_urls

@app.route('/api/downloadBoard', methods=['POST'])
def download_board():
    """Endpoint to get board preview (metadata + 8 images)"""
    data = request.json
    board_url = data.get('boardUrl')
    
    if not board_url:
        return jsonify({'message': 'Board URL is required'}), 400
    
    driver = None
    try:
        driver = setup_driver()
        result = get_board_preview(driver, board_url)
        
        return jsonify({
            'message': 'Board URL verified and processing started.',
            'apiResult': {
                'data': result
            }
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'message': 'Failed to process the board URL.'}), 500
    
    finally:
        if driver:
            driver.quit()

@app.route('/api/downloadZip', methods=['POST'])
def download_zip():
    """Endpoint to scrape all images and create zip file"""
    data = request.json
    board_url = data.get('boardUrl')
    board_name = data.get('boardName', 'pinterest_pins')
    
    if not board_url:
        return jsonify({'error': 'Board URL is required'}), 400
    
    # Sanitize filename
    safe_filename = re.sub(r'[^a-z0-9_\-]', '_', board_name.lower())
    if not safe_filename:  # If name becomes empty after sanitization
        safe_filename = 'pinterest_pins'
    zip_filename = f'{safe_filename}.zip'
    
    print(f"Creating zip file: {zip_filename}")
    
    driver = None
    try:
        # Scrape all images
        driver = setup_driver()
        image_urls = scrape_all_images(driver, board_url)
        
        # Create zip file in memory
        zip_buffer = BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for idx, image_url in enumerate(image_urls):
                try:
                    # Download image
                    response = requests.get(image_url, timeout=10)
                    
                    if response.status_code == 200:
                        # Determine file extension
                        ext = 'jpg'
                        if 'png' in image_url.lower():
                            ext = 'png'
                        elif 'gif' in image_url.lower():
                            ext = 'gif'
                        
                        # Add to zip
                        zip_file.writestr(f'pin-{idx+1}.{ext}', response.content)
                        print(f"Downloaded image {idx+1}/{len(image_urls)}")
                    
                except Exception as e:
                    print(f"Failed to download image {idx+1}: {str(e)}")
                    continue
        
        # Prepare zip for download
        zip_buffer.seek(0)
        
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name=zip_filename
        )
    
    except Exception as e:
        print(f"Error creating zip: {str(e)}")
        return jsonify({'error': 'Failed to create zip file'}), 500
    
    finally:
        if driver:
            driver.quit()

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=port)