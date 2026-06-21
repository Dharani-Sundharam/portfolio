'use client'

import Desktop from '@/components/desktop/Desktop'

// Dev shortcut: jump straight to the desktop, skipping the boot sequence.
// The full BIOS → boot → login → desktop flow lives at `/`.
export default function OsPage() {
  return <Desktop />
}
