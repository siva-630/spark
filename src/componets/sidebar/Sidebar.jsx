import React, { useState } from 'react'

import './Sidebar.css'
import {assets} from '../../assets/assets'

const Sidebar = ({
  chatTabs = [],
  activeTabId,
  onSelectTab,
  onCreateTab,
  onDeleteTab,
  activityLog = [],
  onClearHistory,
  onHelpSubmit,
  theme = 'white',
  onThemeChange,
  accountDetails = {}
}) => {
 
const[extended,setExtended]= useState(true)
const [activePanel, setActivePanel] = useState(null)
const [helpEmail, setHelpEmail] = useState('')
const [helpProblem, setHelpProblem] = useState('')
const [helpStatus, setHelpStatus] = useState('')

const getTabLabel = (tab) => {
  if (tab?.lastPrompt) return tab.lastPrompt
  return tab?.title || 'New Chat'
}

const openPanel = (panelName) => {
  setActivePanel((prev) => prev === panelName ? null : panelName)
}

const handleHelpSubmit = (e) => {
  e.preventDefault()

  if (!helpEmail.trim() || !helpProblem.trim()) {
    setHelpStatus('Please enter your email and describe the issue.')
    return
  }

  onHelpSubmit?.({
    email: helpEmail.trim(),
    problem: helpProblem.trim()
  })

  setHelpStatus('Thanks! Your issue has been recorded.')
  setHelpProblem('')
}

const renderPanelTitle = () => {
  if (activePanel === 'help') return 'Help & Support'
  if (activePanel === 'activity') return 'Activity'
  if (activePanel === 'settings') return 'Settings'
  return ''
}
   
  return (
    <div className='sidebar'>

      <div className="top">
       <img  onClick={()=>setExtended(p=>!p)} className =" menu"  src={assets.list} alt="" />
       <div className="new-chat" onClick={onCreateTab}>
        <img src={assets.add} alt="" />
       {extended ? <p>New Chat</p>:null}
       </div>

       {extended ?<div className="recent">
        <p className="recent-title">Recent</p>
        <div className="recent-list">
          {chatTabs.map((tab) => (
            <div
              key={tab.id}
              className={`recent-entry ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => onSelectTab?.(tab.id)}
              title={getTabLabel(tab)}
            >
              <div className="recent-entry-content">
                <img src={assets.message} alt="" />
                <p>{getTabLabel(tab).slice(0, 24)}</p>
              </div>
              <button
                type="button"
                className="recent-delete"
                aria-label={`Delete ${getTabLabel(tab)}`}
                title="Delete tab"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteTab?.(tab.id)
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
       </div> 
       :null }
       

      </div>
      <div className="bottom">
        <div className={`bottom-item recent-entry ${activePanel === 'help' ? 'active' : ''}`} onClick={() => openPanel('help')}>
          <img src={assets.question} alt="" />
          {extended?<p>Help</p>:null}
        </div>

          <div className={`bottom-item recent-entry ${activePanel === 'activity' ? 'active' : ''}`} onClick={() => openPanel('activity')}>
          <img src={assets.history} alt="" />
        {extended?<p>Activity</p>:null} 
        </div>

          <div className={`bottom-item recent-entry ${activePanel === 'settings' ? 'active' : ''}`} onClick={() => openPanel('settings')}>
          <img src={assets.settings} alt="" />
          {extended?<p>Settings</p>:null}
        </div>

        {activePanel ? (
          <div className="side-panel">
            <div className="panel-header">
              <p>{renderPanelTitle()}</p>
              <button type="button" onClick={() => setActivePanel(null)} aria-label="Close panel">×</button>
            </div>

            {activePanel === 'help' ? (
              <form className="help-form" onSubmit={handleHelpSubmit}>
                <label htmlFor="help-email">Email</label>
                <input
                  id="help-email"
                  type="email"
                  value={helpEmail}
                  onChange={(e) => setHelpEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <label htmlFor="help-problem">Problem description</label>
                <textarea
                  id="help-problem"
                  rows="4"
                  value={helpProblem}
                  onChange={(e) => setHelpProblem(e.target.value)}
                  placeholder="Tell us what went wrong..."
                />
                <button type="submit">Send</button>
                {helpStatus ? <small>{helpStatus}</small> : null}
              </form>
            ) : null}

            {activePanel === 'activity' ? (
              <div className="activity-list">
                {activityLog.length === 0 ? (
                  <p className="muted-text">No activity yet.</p>
                ) : (
                  activityLog.map((activity) => (
                    <div className="activity-item" key={activity.id}>
                      <p>{activity.label}</p>
                      <span>{new Date(activity.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {activePanel === 'settings' ? (
              <div className="settings-panel">
                <p className="section-title">Theme color</p>
                <div className="theme-buttons">
                  {['white', 'dark'].map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={theme === option ? 'selected' : ''}
                      onClick={() => onThemeChange?.(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <button type="button" className="clear-btn" onClick={onClearHistory}>
                  Clear chat history
                </button>

                <div className="account-details">
                  <p className="section-title">Account details</p>
                  <p><strong>Name:</strong> {accountDetails.name || 'Guest User'}</p>
                  <p><strong>Email:</strong> {accountDetails.email || 'Not set'}</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

      </div>
    </div>
  )
}

export default Sidebar