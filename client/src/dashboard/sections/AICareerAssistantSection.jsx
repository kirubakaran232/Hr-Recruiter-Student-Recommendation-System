import { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, User, Sparkles, RefreshCw, CheckCircle2, Trophy, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';

export default function AICareerAssistantSection() {
  const { profileData, askAssistant, analyzing } = useProfile();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const history = profileData?.assistantHistory?.length > 0
    ? profileData.assistantHistory
    : [
        {
          id: 'init-1',
          sender: 'ai',
          text: 'Hello! I am your TalentOS AI Career Assistant. Ask me anything about improving your profile score, interview readiness, or skill growth.',
          timestamp: new Date()
        }
      ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || inputText).trim();
    if (!textToSend || analyzing) return;
    setInputText('');
    try {
      await askAssistant(textToSend);
    } catch (err) {
      console.error('Failed to send assistant query:', err);
    }
  };

  const handlePresetClick = (preset) => {
    handleSend(preset);
  };

  return (
    <div className='career-assistant-page'>
      {/* Header Banner */}
      <div className='ai-header-card'>
        <div className='ai-header-info'>
          <div className='ai-badge-pill'>
            <Sparkles size={14} />
            <span>AI Career Assistant</span>
          </div>
          <h2 className='ai-header-title'>Personalized AI Career Guidance</h2>
          <p className='ai-header-subtitle'>
            Chat with your AI advisor to evaluate role readiness, pinpoint profile strengths, and receive instant career improvement advice.
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className='assistant-presets-row'>
        <span className='presets-label'>
          <HelpCircle size={16} /> Quick Questions:
        </span>
        <button
          type='button'
          className='preset-pill-btn'
          onClick={() => handlePresetClick('How can I improve my profile score?')}
        >
          "How can I improve my profile score?"
        </button>
        <button
          type='button'
          className='preset-pill-btn'
          onClick={() => handlePresetClick('Am I ready for a software engineer role?')}
        >
          "Am I ready for a software engineer role?"
        </button>
      </div>

      {/* Chat Window */}
      <div className='assistant-chat-window'>
        <div className='chat-messages-area'>
          {history.map((msg) => (
            <div
              key={msg.id || msg.timestamp}
              className={`chat-message-row ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`}
            >
              <div className='msg-avatar'>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className='msg-bubble-wrap'>
                <div className='msg-bubble'>
                  <p className='msg-text'>{msg.text}</p>
                </div>

                {/* Structured Readiness Card if present */}
                {msg.structuredCard && (
                  <div className='readiness-structured-card'>
                    <div className='readiness-score-header'>
                      <Trophy size={18} className='text-amber' />
                      <div className='readiness-title-wrap'>
                        <span className='r-label'>Software Engineer Role Readiness</span>
                        <strong className='r-score'>Readiness Score: {msg.structuredCard.readinessScore || 82}%</strong>
                      </div>
                    </div>

                    <div className='readiness-details-grid'>
                      <div className='r-detail-col strength-col'>
                        <h5 className='r-col-title text-success'>
                          <CheckCircle2 size={14} /> Strengths
                        </h5>
                        <div className='r-tags'>
                          {msg.structuredCard.strengths?.map((s, sIdx) => (
                            <span key={sIdx} className='r-tag strength-tag'>
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className='r-detail-col improve-col'>
                        <h5 className='r-col-title text-amber'>
                          <ArrowUpRight size={14} /> Areas to Improve
                        </h5>
                        <div className='r-tags'>
                          {msg.structuredCard.improvements?.map((imp, iIdx) => (
                            <span key={iIdx} className='r-tag improve-tag'>
                              • {imp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <span className='msg-timestamp'>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className='chat-input-bar'>
          <input
            type='text'
            className='chat-input'
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder='Ask AI Career Assistant (e.g., "Am I ready for a software engineer role?")...'
          />
          <button
            type='button'
            className='chat-send-btn'
            onClick={() => handleSend()}
            disabled={analyzing || !inputText.trim()}
          >
            {analyzing ? <RefreshCw size={18} className='spin-icon' /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
