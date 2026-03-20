import React, { useState } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { generateContentSync } from '../../config/spark'

const Main = () => {
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState('');
  const [typingAnswer, setTypingAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  // Typing effect
  const typeText = (text) => {
    setTypingAnswer('');
    let i = 0;
    function type() {
      setTypingAnswer((prev) => prev + text.charAt(i));
      i++;
      if (i < text.length) {
        setTimeout(type, 20);
      }
    }
    type();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setAnswer('');
    setTypingAnswer('');
    try {
      const res = await generateContentSync(input);
      setAnswer(res);
      typeText(res);
    } catch (err) {
      setAnswer('Error: ' + err.message);
      setTypingAnswer('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
   <div className="main">
    <div className="nav">
        <p>Spark</p>
        <img src={assets.ab} alt="" />
    </div>
    <div className="main-container">
        <div className="greet">
            <p><span>Hello,Siva.</span></p>
            <p>How can I help you today</p>
        </div>
        <div className="cards">
            <div className="card">
                <p>Suggest rich places to see on an upcoming road trip</p>
                <img src={assets.compass} alt="" />
            </div>
            <div className="card">
                <p>Brainstrom team bonding activities for our work</p>
                <img src={assets.light} alt="" />
            </div>
            <div className="card">
                <p>Summarize  your activities</p>
                <img src={assets.message} alt="" />
            </div>
            <div className="card">
                <p>
                    Improve the readability of the following code
                </p>
                <img src={assets.code} alt="" />
            </div>
        </div>
        <div className="main-bottom">
            <div className="search-box">
                <input
                  type="text"
                  placeholder='Enter a prompt here'
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  disabled={loading}
                />
                <div>
                    <img src={assets.picture} alt="" />
                    <img src={assets.mic} alt="" />
                    <img
                      src={assets.send}
                      alt="send"
                      style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
                      onClick={loading ? undefined : handleSend}
                    />
                </div>
            </div>
            {/* Typing effect answer display */}
            {typingAnswer && (
              <div className="gemini-answer" style={{ marginTop: 16, background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                {typingAnswer}
              </div>
            )}
            {loading && <p style={{ color: '#888', marginTop: 8 }}>Thinking...</p>}
            <p className="bottom-info">
            spark may display inaccurate about people,so double-check its responses .Your privacy and spark.
        </p>
        </div>
        
    </div>
   </div>
  )
}

export default Main