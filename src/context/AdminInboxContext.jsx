import { createContext, useContext } from 'react'
import { useAdminList } from '../components/admin/useAdminList.js'
import { getContactMessages } from '../services/adminService.js'

/**
 * Contact form messages (GET /api/admin/contact-messages), loaded once for the admin panel and shared by the
 * sidebar's unread badge and the Messages page, the same way AdminReviewsContext serves the reviews.
 */
const AdminInboxContext = createContext(null)

export function AdminInboxProvider({ children }) {
  const messages = useAdminList(getContactMessages)
  return <AdminInboxContext.Provider value={messages}>{children}</AdminInboxContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- provider + hook birlikte tutulur
export function useAdminInbox() {
  const context = useContext(AdminInboxContext)
  if (!context) throw new Error('useAdminInbox must be used within an AdminInboxProvider')
  return context
}
