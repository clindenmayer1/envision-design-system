/* On-screen camera-pose readout. Listens for the 'envision:pose' event fired
 * when "P" is pressed in the 3D view, and shows the pose JSON in a pre-selected,
 * read-only box so it can be copied (Cmd/Ctrl+C) and pasted — visible feedback
 * that pressing P worked, independent of clipboard-permission quirks. */
import { useEffect, useRef, useState } from 'react'
import './PoseReadout.css'

export default function PoseReadout() {
  const [text, setText] = useState<string | null>(null)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const onPose = (e: Event) => setText((e as CustomEvent<string>).detail)
    window.addEventListener('envision:pose', onPose)
    return () => window.removeEventListener('envision:pose', onPose)
  }, [])

  useEffect(() => {
    if (text && ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [text])

  if (!text) return null
  return (
    <div className="pose-readout">
      <div className="pose-readout__head">
        <span>Camera pose — ⌘/Ctrl+C to copy, then paste to Claude</span>
        <button type="button" className="pose-readout__close" onClick={() => setText(null)} aria-label="Close">
          ×
        </button>
      </div>
      <textarea ref={ref} className="pose-readout__text" readOnly rows={3} value={text} />
    </div>
  )
}
