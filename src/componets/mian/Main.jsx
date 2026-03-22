import React, { useEffect, useMemo, useRef, useState } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { generateContentSync } from '../../config/spark'

const Main = ({ activeTab, onSendComplete }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingResponse, setPendingResponse] = useState('');
  const [attachedImages, setAttachedImages] = useState([]);
  const [micSupported, setMicSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micStatus, setMicStatus] = useState('');
  const [copiedMessageKey, setCopiedMessageKey] = useState('');

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const micTranscriptRef = useRef('');
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingResolveRef = useRef(null);
  const activeRequestIdRef = useRef(0);
  const cancelledRequestIdRef = useRef(0);

  const messages = useMemo(() => activeTab?.messages || [], [activeTab]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setMicSupported(Boolean(SpeechRecognition));

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 140);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, pendingResponse, loading]);

  const stopTyping = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    if (typingResolveRef.current) {
      typingResolveRef.current();
      typingResolveRef.current = null;
    }
  }

  // Typing effect
  const typeText = (text) => {
    const safeText = String(text ?? '');
    stopTyping();
    setPendingResponse('');

    return new Promise((resolve) => {
      typingResolveRef.current = resolve;

      if (!safeText.length) {
        typingResolveRef.current = null;
        resolve();
        return;
      }

      let i = 0;

      const type = () => {
        setPendingResponse((prev) => prev + safeText.charAt(i));
        i += 1;

        if (i < safeText.length) {
          typingTimerRef.current = setTimeout(type, 16);
          return;
        }

        typingTimerRef.current = null;
        typingResolveRef.current = null;
        resolve();
      }

      type();
    });
  };

  const handleSend = async (customPrompt) => {
    if (loading) return;

    const requestId = Date.now();
    activeRequestIdRef.current = requestId;
    cancelledRequestIdRef.current = 0;

    const imagePrompt = attachedImages.length
      ? `\n\nAttached images: ${attachedImages.map((file) => file.name).join(', ')}`
      : '';

    const promptText = `${(customPrompt ?? input).trim()}${customPrompt ? '' : imagePrompt}`.trim();
    if (!promptText) return;

    if (!customPrompt) {
      setInput('');
      setAttachedImages([]);
    }

    setLoading(true);
    setPendingResponse('');

    try {
      const res = await generateContentSync(promptText);
      if (activeRequestIdRef.current !== requestId || cancelledRequestIdRef.current === requestId) {
        return;
      }

      const responseText = String(res ?? '');
      await typeText(responseText);

      if (activeRequestIdRef.current !== requestId || cancelledRequestIdRef.current === requestId) {
        return;
      }

      onSendComplete?.({ prompt: promptText, response: responseText });
    } catch (err) {
      const errorText = 'Error: ' + err.message;

      if (cancelledRequestIdRef.current === requestId) {
        return;
      }

      stopTyping();
      setPendingResponse(errorText);
      onSendComplete?.({ prompt: promptText, response: errorText });
    } finally {
      if (activeRequestIdRef.current === requestId) {
        activeRequestIdRef.current = 0;
        setLoading(false);
      }

      if (cancelledRequestIdRef.current === requestId) {
        cancelledRequestIdRef.current = 0;
      }
    }
  };

  const stopGeneration = () => {
    if (!loading) return;

    cancelledRequestIdRef.current = activeRequestIdRef.current;
    stopTyping();
    setPendingResponse('');
    setLoading(false);
    setMicStatus('Generation stopped.');
  }

  const handleImageIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    setAttachedImages((prev) => [...prev, ...selectedFiles].slice(0, 6));
    setMicStatus(`${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''} attached`);

    event.target.value = '';
  };

  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicStatus('Voice recording is not supported in this browser.');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setMicStatus('Recording voice...');
        micTranscriptRef.current = '';
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript || '')
          .join(' ')
          .trim();

        micTranscriptRef.current = transcript;
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setMicStatus('Could not capture voice. Please try again.');
      };

      recognition.onend = () => {
        setIsRecording(false);
        const transcript = micTranscriptRef.current.trim();

        if (transcript) {
          setInput((prev) => `${prev} ${transcript}`.trim());
          setMicStatus('Voice added to input.');
        } else if (micSupported) {
          setMicStatus('Recording stopped. No voice detected.');
        }
      };

      recognitionRef.current = recognition;
    }

    try {
      if (isRecording) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } catch {
      setIsRecording(false);
      setMicStatus('Microphone is busy. Please try again.');
    }
  };

  const handleCopyMessage = async (text, key) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageKey(key);
      setTimeout(() => setCopiedMessageKey(''), 1400);
    } catch {
      setMicStatus('Could not copy text. Please try again.');
    }
  };

  const starterPrompts = [
    'Suggest rich places to see on an upcoming road trip',
    'Brainstrom team bonding activities for our work',
    'Summarize your activities',
    'Improve the readability of the following code'
  ]

  return (
   <div className="main">
    <div className="nav">
        <p>Spark</p>
        <img src={assets.ab} alt="" />
    </div>
    <div className="main-container">
        {messages.length === 0 && !loading ? (
          <>
            <div className="greet">
              <p><span>Hello,Siva.</span></p>
              <p>How can I help you today</p>
            </div>
            <div className="cards">
              <div className="card" onClick={() => handleSend(starterPrompts[0])}>
                <p>Suggest rich places to see on an upcoming road trip</p>
                <img src={assets.compass} alt="" />
              </div>
              <div className="card" onClick={() => handleSend(starterPrompts[1])}>
                <p>Brainstrom team bonding activities for our work</p>
                <img src={assets.light} alt="" />
              </div>
              <div className="card" onClick={() => handleSend(starterPrompts[2])}>
                <p>Summarize  your activities</p>
                <img src={assets.message} alt="" />
              </div>
              <div className="card" onClick={() => handleSend(starterPrompts[3])}>
                <p>
                  Improve the readability of the following code
                </p>
                <img src={assets.code} alt="" />
              </div>
            </div>
          </>
        ) : (
          <div className="chat-window">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chat-bubble ${message.role === 'user' ? 'user' : 'assistant'}`}
              >
                <p className="chat-role">{message.role === 'user' ? 'You' : 'Spark'}</p>
                {message.role === 'assistant' ? (
                  <button
                    type="button"
                    className="copy-response-btn"
                    onClick={() => handleCopyMessage(message.text, `assistant-${index}`)}
                    title={copiedMessageKey === `assistant-${index}` ? 'Copied' : 'Copy response'}
                    aria-label="Copy Spark response"
                  >
                    {copiedMessageKey === `assistant-${index}` ? '✓' : '⧉'}
                  </button>
                ) : null}
                <p className="chat-message-text">{message.text}</p>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant pending">
                <p className="chat-role">Spark</p>
                <button
                  type="button"
                  className="copy-response-btn"
                  onClick={() => handleCopyMessage(pendingResponse || 'Thinking...', 'assistant-pending')}
                  title={copiedMessageKey === 'assistant-pending' ? 'Copied' : 'Copy response'}
                  aria-label="Copy Spark response"
                >
                  {copiedMessageKey === 'assistant-pending' ? '✓' : '⧉'}
                </button>
                <p className="chat-message-text">{pendingResponse || 'Thinking...'}</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
        <div className="main-bottom">
            <div className="search-box">
                <textarea
                  ref={textareaRef}
                  placeholder='Enter a prompt here'
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={loading}
                  rows={1}
                />
                <div>
                    <button type="button" className="icon-button" onClick={handleImageIconClick} title="Upload images">
                      <img src={assets.picture} alt="upload" />
                    </button>
                    <button
                      type="button"
                      className={`icon-button ${isRecording ? 'recording' : ''}`}
                      onClick={startVoiceRecording}
                      title={isRecording ? 'Stop recording' : 'Start voice recording'}
                    >
                      <img src={assets.mic} alt="mic" />
                    </button>
                    {loading ? (
                      <button
                        type="button"
                        className="stop-generate-btn"
                        title="Stop generation"
                        aria-label="Stop generation"
                        onClick={stopGeneration}
                      >
                        ■
                      </button>
                    ) : (
                      <img
                        src={assets.send}
                        alt="send"
                        style={{ cursor: 'pointer', opacity: 1 }}
                        onClick={handleSend}
                      />
                    )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden-file-input"
                  onChange={handleImageUpload}
                />
            </div>
            {attachedImages.length > 0 ? (
              <div className="attached-images">
                {attachedImages.map((file, index) => (
                  <span key={`${file.name}-${index}`} className="image-chip">{file.name}</span>
                ))}
              </div>
            ) : null}
            {micStatus ? <p className="mic-status">{micStatus}</p> : null}
            <p className="bottom-info">
            spark may display inaccurate about people,so double-check its responses .Your privacy and spark.
        </p>
        </div>
        
    </div>
   </div>
  )
}

export default Main