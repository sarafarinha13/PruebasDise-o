export default function Leaf({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <path d="M100 190V90" stroke="#3f7a2c" strokeWidth="12" strokeLinecap="round" />
      <path d="M100 100C40 100 30 50 100 10c70 40 60 90 0 90z" fill="#3f7a2c" />
    </svg>
  )
}
