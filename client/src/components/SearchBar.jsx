import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SearchBar.css';
import SearchIcon from '../assets/search-favorite.svg';
import NotFound from '../assets/NotFoundMonster.png';


function isValidPinterestBoard(input) {
  let url = input.replace(/^https?:\/\//, '');
  url = url.replace(/^([a-z0-9-]+\.)*pinterest\.[a-z.]{2,6}\//, '');
  const pattern = /^[\w-]+\/[\w-]+\/?$/;
  return pattern.test(url);
}

const SearchBar = () => {
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);

  const [boardInfo, setBoardInfo] = useState(null)
  const [pins, setPins] = useState([])

  const [isLoading, setIsLoading] = React.useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [downloadProgress, setDownloadProgress] = useState(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setValidationError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
      // Extract username and board from URL
      const url = new URL(boardUrl.startsWith('http') ? boardUrl : `https://${boardUrl}`);
      const parts = url.pathname.split('/').filter(Boolean);

      if (parts.length < 2) {
        setValidationError('Please enter a valid Pinterest board URL.');
        setIsLoading(false);
        return;
      }

      const username = parts[0];
      const boardSection = parts[1];

      // Call pidgets API directly from frontend
      const res = await fetch(
        `https://api.pinterest.com/v3/pidgets/boards/${username}/${boardSection}/pins/`
      );

      const data = await res.json();

      if (data.status !== 'success') {
        setModalStatus('error');
      } else {
        const board = data.data?.board;
        const pins = data.data?.pins || [];

        setBoardInfo({
          name: board?.name,
          pin_count: board?.pin_count,
          image_thumbnail_url: board?.image_thumbnail_url,
        });

        setPins(pins.slice(0, 8).map((pin, idx) => ({
          id: `pin-${idx + 1}`,
          images: {
            '236x': {
              url: pin?.images?.['236x']?.url
            }
          }
        })));

        setModalStatus('success');
      }
    } catch (error) {
      console.error(error);
      setModalStatus('error');
    } finally {
      setIsLoading(false);
      setIsModalOpen(true);
    }
  };

  const handleZipDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress({ message: 'Starting...', current: 0, total: 0 });

    try {
      const response = await fetch('https://pinhoader.onrender.com/api/downloadZip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardUrl: inputValue,
          boardName: boardInfo?.name || 'pinterest_board'
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

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
              // decode base64 zip and trigger browser download
              const bytes = atob(event.data);
              const arr = new Uint8Array(bytes.length);
              for (let i = 0; i < bytes.length; i++) {
                arr[i] = bytes.charCodeAt(i);
              }
              const blob = new Blob([arr], { type: 'application/zip' });
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
            console.error('Failed to parse SSE event:', parseErr);
          }
        }
      }

    } catch (err) {
      console.error('Download failed:', err);
    } finally {
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
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} className='close-cross'>X</button>
            <div className="board-result">
              {modalStatus === 'error' && (
                <div className='modal-error'>
                  <img src={NotFound} alt="Not Found" className='not-found-img' />
                  <div>
                    <h2>Not Found :(</h2>
                    <p className='error-notes'> • We might have a problem with our server backend :(.</p>
                    <p className='error-notes'> • Please check the link.</p>
                    <p className='error-notes'> • Please make sure the board is public.</p>
                    <button onClick={closeModal} className='try-again'>Go Back</button>
                  </div>
                </ div>
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
                          {isDownloading && downloadProgress && (
                            <div style={{ marginTop: '12px' }}>
                              <p style={{ color: 'green', margin: '0 0 6px' }}>
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
