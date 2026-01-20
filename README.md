#  PinHoader

A free Pinterest board downloader that lets you download entire boards as a zip file with just one click!

## ⚠️ IMPORTANT NOTICE

**THE FIRST SEARCH MAY TAKE 30-60 SECONDS TO LOAD!**

This is because the free backend server (Render) goes to sleep after 15 minutes of inactivity. The first request wakes it up, which takes about a minute. After that, all subsequent searches will be fast!

Please be patient on your first search. ☕

---

##  Features

-  **Simple & Fast** - Just paste a Pinterest board URL and download
-  **Bulk Download** - Downloads up to 250 pins per board
-  **Original Quality** - Downloads images in their original resolution
-  **Preview Before Download** - See 8 preview images before downloading
-  **Completely Free** - No subscriptions, no limits
-  **Public Boards Only** - Works with any public Pinterest board

---

##  How to Use

1. **Find a Pinterest Board** - Go to Pinterest and find any public board you want to download
2. **Copy the URL** - Copy the board URL from your browser
   - Example: `https://pinterest.com/username/board-name/`
3. **Paste & Search** - Paste the URL into PinHoader and click Search
4. **Preview** - Check out the board details and preview images
5. **Download** - Click the Download button to get your zip file!

⏱️ Remember: First search takes ~1 minute, then it's fast!

---

##  Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Deployed on Vercel** - Lightning-fast hosting

### Backend
- **Python** - Server language
- **Flask** - Web framework
- **Selenium** - Web scraping
- **ChromeDriver** - Browser automation
- **Deployed on Render** - Free tier hosting

---

## 🏗️ Local Development

Want to run PinHoader locally? Here's how:

### Prerequisites
- Node.js (v16+)
- Python (v3.11+)
- Chrome browser

### Frontend Setup

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Backend Setup

```bash
# Navigate to server folder
cd server

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

Backend will run on `http://localhost:3001`

### Update API URLs

When running locally, update the fetch URLs in `client/src/components/SearchBar.jsx`:

```javascript
// Change from production URL to:
fetch('http://localhost:3001/api/downloadBoard', ...)
```

---

## 📝 Environment Variables

### Backend (Optional)
- `PORT` - Server port (default: 3001)
- `PYTHON_VERSION` - Python version for deployment (default: 3.11.0)

---

## 🚨 Limitations

- **Public boards only** - Cannot access private or secret boards
- **250 pins max** - Limited to 250 images per download
- **First request slow** - Free hosting goes to sleep after inactivity
- **No videos** - Only downloads images, not video pins
- **Rate limiting** - Pinterest may block if you scrape too aggressively


---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚖️ Disclaimer

This tool is for **personal use only**. Please respect Pinterest's Terms of Service and copyright laws:

- Only download boards you have permission to download
- Do not redistribute downloaded content without permission
- Do not use this tool for commercial purposes without proper rights
- Respect artists' and creators' intellectual property

**Use responsibly and ethically!**

---

## 🐛 Known Issues

- **Slow first load** - Free tier limitation (server sleeps)
- **Some boards fail** - Pinterest's structure varies, some boards may not work
- **Rate limiting** - Too many rapid requests may trigger blocks

---

## 💡 Tips

- **Be patient on first search** - It will be fast after the initial wake-up
- **Check board visibility** - Make sure the board is public
- **Avoid rapid requests** - Wait between downloads to avoid rate limits
- **Clear browser cache** - If you see old data, hard refresh (Ctrl+Shift+R)

---

## 📧 Support

Found a bug or have a feature request?

- Open an issue on GitHub
- Or contact via GitHub discussions

---

## 🙏 Acknowledgments

- Built with love for the Pinterest community
- Thanks to Render and Vercel for free hosting
- Powered by Selenium and Flask

---

## ⭐ Star This Repo!

If you found this useful, please give it a star! It helps others discover the project.

---

**Happy Downloading! 📌✨**