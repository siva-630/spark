import React, { useMemo, useState } from 'react'
import Sidebar from './componets/sidebar/Sidebar'
import Main from './componets/mian/Main'
import './App.css'

const createChatTab = (index = 1) => ({
  id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: `New Chat ${index}`,
  messages: [],
  lastPrompt: '',
  updatedAt: Date.now()
})

const createActivityEntry = (label) => ({
  id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label,
  createdAt: Date.now()
})

const App = () => {
  const [chatTabs, setChatTabs] = useState([createChatTab(1)])
  const [activeTabId, setActiveTabId] = useState(chatTabs[0].id)
  const [theme, setTheme] = useState('white')
  const [activityLog, setActivityLog] = useState([
    createActivityEntry('Welcome to Spark AI')
  ])

  const logActivity = (label) => {
    setActivityLog((prev) => [createActivityEntry(label), ...prev].slice(0, 30))
  }

  const activeTab = useMemo(
    () => chatTabs.find((tab) => tab.id === activeTabId) || chatTabs[0],
    [chatTabs, activeTabId]
  )

  const createNewTab = () => {
    const nextTab = createChatTab(chatTabs.length + 1)
    setChatTabs((prev) => [nextTab, ...prev])
    setActiveTabId(nextTab.id)
    logActivity(`Created ${nextTab.title}`)
  }

  const selectTab = (id) => {
    setActiveTabId(id)
    const selectedTab = chatTabs.find((tab) => tab.id === id)
    if (selectedTab?.title) {
      logActivity(`Opened ${selectedTab.title}`)
    }
  }

  const deleteTab = (id) => {
    setChatTabs((prev) => {
      const nextTabs = prev.filter((tab) => tab.id !== id)
      const deletedTab = prev.find((tab) => tab.id === id)

      if (deletedTab?.title) {
        logActivity(`Deleted ${deletedTab.title}`)
      }

      if (nextTabs.length === 0) {
        const fallbackTab = createChatTab(1)
        setActiveTabId(fallbackTab.id)
        return [fallbackTab]
      }

      if (id === activeTabId) {
        setActiveTabId(nextTabs[0].id)
      }

      return nextTabs
    })
  }

  const appendMessageToActiveTab = ({ prompt, response }) => {
    setChatTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab

        const nextMessages = [
          ...tab.messages,
          { role: 'user', text: prompt },
          { role: 'assistant', text: response }
        ]

        return {
          ...tab,
          title: tab.messages.length === 0 ? prompt.slice(0, 30) || tab.title : tab.title,
          lastPrompt: prompt,
          messages: nextMessages,
          updatedAt: Date.now()
        }
      })
    )

    logActivity(`Asked: ${prompt.slice(0, 45)}`)
  }

  const clearChatHistory = () => {
    const firstTab = createChatTab(1)
    setChatTabs([firstTab])
    setActiveTabId(firstTab.id)
    setActivityLog([createActivityEntry('Chat history cleared')])
  }

  const submitHelpRequest = ({ email, problem }) => {
    logActivity(`Help request sent by ${email}: ${problem.slice(0, 40)}`)
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      <Sidebar
        chatTabs={chatTabs}
        activeTabId={activeTab?.id}
        onSelectTab={selectTab}
        onCreateTab={createNewTab}
        onDeleteTab={deleteTab}
        activityLog={activityLog}
        onClearHistory={clearChatHistory}
        onHelpSubmit={submitHelpRequest}
        theme={theme}
        onThemeChange={setTheme}
        accountDetails={{
          name: 'Siva',
          email: 'siva@spark.ai'
        }}
      />
      <Main
        activeTab={activeTab}
        onSendComplete={appendMessageToActiveTab}
      />
  </div>

  )
}

export default App