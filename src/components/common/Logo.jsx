export default function Logo({ size = 'md' }) {
  const heights = { sm: '48px', md: '64px', lg: '88px' }
  const height = heights[size] || heights.md

  return (
    <div style={{ overflow: 'hidden', height, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      <img
        src="/logo.jpg"
        alt="PartyScout"
        style={{ height: `calc(${height} + 12px)`, width: 'auto', display: 'block', margin: '-6px' }}
      />
    </div>
  )
}
