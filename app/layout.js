export const metadata = {
  title: 'CS-like FPS Game',
  description: 'First-person shooter game built with Next.js and Three.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, overflow: 'hidden', backgroundColor: '#000' }}>
        {children}
      </body>
    </html>
  )
}
