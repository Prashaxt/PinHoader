import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SearchBar.css';
import SearchIcon from '../assets/search-favorite.svg';
import NotFound from '../assets/NotFoundMonster.png';


function isPinItLink(input) {
  return /pin\.it\//.test(input);
}

function isValidPinterestBoard(input) {
  // Allow pin.it short links
  if (isPinItLink(input)) return true;

  // Allow all pinterest domain variants
  let url = input.replace(/^https?:\/\//, '');
  url = url.replace(/^([a-z0-9-]+\.)*pinterest\.[a-z.]{2,6}\//, '');
  const pattern = /^[\w-]+\/[\w-]+\/?/;
  return pattern.test(url);
}

function setCleanUrl(input) {
  const url = new URL(input);
  const cleanUrl = url.origin + url.pathname;
  return cleanUrl;

}

const SearchBar = () => {
  const [inputValue, setInputValue] = useState('');
  const [finalUrl, setFinalUrl] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);

  const [boardInfo, setBoardInfo] = useState(null)
  const [boardOwnerInfo, setBoardOwnerInfo] = useState(null)
  const [pins, setPins] = useState([])

  const [isLoading, setIsLoading] = React.useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [downloadProgress, setDownloadProgress] = useState(null);

  const [errorType, setErrorType] = useState('generic');

  const abortControllerRef = React.useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setValidationError('');
  };

  const closeModal = () => {
    // Cancel any in-progress download
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsModalOpen(false);
    setIsDownloading(false);
    setDownloadProgress(null);
  };

  const handleSearch = async (boardUrl) => {
    if (!boardUrl.trim()) {
      setValidationError('Input cannot be empty.');
      return;
    }

    if (!isValidPinterestBoard(boardUrl)) {
      setValidationError('Please enter a valid Pinterest board URL.');
      return;
    }

    setValidationError('');
    setIsLoading(true);


    try {
      let resolvedUrl = boardUrl.startsWith('http') ? boardUrl : `https://${boardUrl}`;

      // Step 1 — Resolve pin.it short links via backend
      if (isPinItLink(resolvedUrl)) {

        const resolveRes = await fetch('https://pinhoader.onrender.com/api/resolveUrl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: resolvedUrl })
        });
        const resolveData = await resolveRes.json();

        if (!resolveRes.ok || !resolveData.resolvedUrl) {
          setValidationError('Could not resolve this link. Try the full Pinterest board URL.');
          setIsLoading(false);
          return;
        }

        resolvedUrl = resolveData.resolvedUrl;
        setValidationError('');
      }
      setFinalUrl(setCleanUrl(resolvedUrl));

      // Step 2 — Extract username and board
      const url = new URL(resolvedUrl);
      const parts = url.pathname.split('/').filter(Boolean);

      if (parts.length < 2) {
        setValidationError('Please enter a valid Pinterest board URL.');
        setIsLoading(false);
        return;
      }

      const username = parts[0];
      const boardSection = parts[1];

      // Step 3 — Call pidgets API
      const baseUrl = import.meta.env.VITE_PINTEREST_API_BASE;
      const apiUrl = `${baseUrl}/${username}/${boardSection}/pins/`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.status !== 'success') {
        setErrorType('not_found');
        setModalStatus('error');
      } else {
        const user = data.data?.user;
        const board = data.data?.board;
        const pins = data.data?.pins || [];

        setBoardOwnerInfo({ ownerName: user?.full_name });
        setBoardInfo({
          name: board?.name,
          pin_count: board?.pin_count,
          image_thumbnail_url: board?.image_thumbnail_url,
        });
        setPins(pins.slice(0, 8).map((pin, idx) => ({
          id: `pin-${idx + 1}`,
          images: { '236x': { url: pin?.images?.['236x']?.url } }
        })));
        setModalStatus('success');
      }
    } catch (error) {
      console.error(error);
      setErrorType('server');
      setModalStatus('error');
    } finally {
      setIsLoading(false);
      setIsModalOpen(true);
    }
  };

const handleZipDownload = async () => {
  setIsDownloading(true);
  setDownloadProgress({ message: 'Starting...', current: 0, total: 0 });

  // abort controller for this download
  const controller = new AbortController();
  abortControllerRef.current = controller;

  try {
    const response = await fetch('https://pinhoader.onrender.com/api/downloadZip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boardUrl: finalUrl,
        boardName: boardInfo?.name || 'pinterest_board',
        boardOwner: boardOwnerInfo?.ownerName || 'unknown_owner'
      }),
      signal: controller.signal  
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Check if aborted
        if (controller.signal.aborted) {
          reader.cancel();
          break;
        }

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const event = JSON.parse(line.replace('data: ', ''));

            if (['scraping', 'downloading', 'zipping'].includes(event.status)) {
              setDownloadProgress({
                message: event.message,
                current: event.current || 0,
                total: event.total || 0
              });
            }

            if (event.status === 'done') {
              const zipRes = await fetch(
                `https://pinhoader.onrender.com/api/getZip/${event.downloadId}`,
                { signal: controller.signal }  
              );
              const blob = await zipRes.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = event.filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              setIsModalOpen(false);
            }

            if (event.status === 'error') {
              console.error('Download error:', event.message);
              setDownloadProgress({ message: event.message, current: 0, total: 0 });
            }

          } catch (parseErr) {
            if (parseErr.name === 'AbortError') break;
            console.error('Failed to parse SSE event:', parseErr);
          }
        }
      }
    } catch (readErr) {
      if (readErr.name !== 'AbortError') {
        console.error('Read error:', readErr);
      }
    }

  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Download failed:', err);
    }
  } finally {
    abortControllerRef.current = null;
    setIsDownloading(false);
    setDownloadProgress(null);
  }
};

return (
  <>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch(inputValue);
      }}
      className="search-bar">
      <input
        id='url'
        type="text"
        placeholder="Pinterest Board Link Here"
        className="no-select"
        value={inputValue}
        onChange={handleInputChange}
      />
      <button
        type='submit'
        className="search-button no-select"
        disabled={isLoading}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isLoading ? (
            <div className="spinner" />
          ) : (
            <>
              <img src={SearchIcon} alt="Search Icon" className="searchIcon" />
              <p>Search</p>
            </>
          )}
        </div>
      </button>
    </form>
    {validationError && (
      <div className='response-texts' style={{ color: 'red' }}>
        {validationError}
      </div>
    )}


    {isModalOpen && (
      <div className="modal-overlay" >
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button onClick={closeModal} className='close-cross'>X</button>
          <div className="board-result">
            {modalStatus === 'error' && (
              <div className='modal-error'>
                <img src={NotFound} alt="Not Found" className='not-found-img' />
                <div>
                  {errorType === 'not_found' && (
                    <>
                      <h2>Board Not Found</h2>
                      <p className='error-notes'>• Make sure the board is public.</p>
                      <p className='error-notes'>• Double check the link is correct.</p>
                    </>
                  )}
                  {errorType === 'server' && (
                    <>
                      <h2>Something Went Wrong</h2>
                      <p className='error-notes'>• Our server had an issue.</p>
                      <p className='error-notes'>• Please try again in a moment.</p>
                    </>
                  )}
                  {errorType === 'generic' && (
                    <>
                      <h2>Not Found :(</h2>
                      <p className='error-notes'>• Please check the link.</p>
                      <p className='error-notes'>• Make sure the board is public.</p>
                    </>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button onClick={closeModal} className='try-again'>Go Back</button>
                  </div>
                </div>
              </div>
            )}

            {modalStatus === 'success' && (
              <div className='modal-success'>
                <div className='modal-success-content'>
                  <div className='board-details'>
                    <div className='board-info'>
                      <img src={boardInfo.image_thumbnail_url} className='board-thumbnail' alt="" />
                      <div>
                        <h3>{boardInfo.name}</h3>
                        <h4>Total Pins: {boardInfo.pin_count} </h4>
                      </div>
                    </div>
                    <button className='download-button' onClick={handleZipDownload} disabled={isDownloading} >
                      <div>
                        {!isDownloading && !downloadProgress && (
                          <p style={{ color: 'white', margin: '0 0 6px' }}>
                            Download
                          </p>
                        )}
                        {isDownloading && downloadProgress && (
                          <div style={{ marginTop: '12px' }}>
                            <p style={{ color: 'white', margin: '0 0 6px' }}>
                              {downloadProgress.message}
                            </p>
                            {downloadProgress.total > 0 && (
                              <>
                                <progress
                                  value={downloadProgress.current}
                                  max={downloadProgress.total}
                                  style={{ width: '100%', height: '6px' }}
                                />
                                <p style={{ fontSize: '12px', color: 'gray', margin: '4px 0 0' }}>
                                  {downloadProgress.current} / {downloadProgress.total} pins
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                    {isDownloading && (
                      <div className='response-texts' style={{ color: 'green' }}>
                        <p>Your Board is downloading, please wait for few seconds.</p>
                      </div>
                    )}
                  </div>

                  <div className="pin-images">
                    {pins.slice(0, 8).map(pin => (
                      <div key={pin.id} className="pin">
                        <img
                          src={pin.images["236x"]?.url}
                        />
                      </div>
                    ))}
                  </div>

                </div>
                <div className='modal-bottom-texts'>
                  <p>You can download maximum of 300 pins per board.</p>
                  {/* <p>To download unlimited photos and videos, Upgrade Your Plan.</p> */}
                </div>

              </ div>
            )}
          </div>
        </div>
      </div>
    )}
  </>
);
};

export default SearchBar;
