/*
 * PullThumb — shows a cabinet-pull thumbnail. The pull is rasterized once by a shared
 * offscreen renderer (see pullThumbRenderer) and shown as a cached <img>, so it stays well
 * within the browser's WebGL-context limit no matter how many pull options exist.
 */
import { useEffect, useState } from 'react'
import { getPullThumb, peekPullThumb } from './pullThumbRenderer'

export default function PullThumb({ url }: { url: string }) {
  const [src, setSrc] = useState<string | undefined>(() => peekPullThumb(url))
  useEffect(() => {
    let cancelled = false
    setSrc(peekPullThumb(url))
    getPullThumb(url).then((d) => { if (!cancelled) setSrc(d) }).catch(() => {})
    return () => { cancelled = true }
  }, [url])
  // Fill the parent thumbnail box completely (stretch to fit) so there's no white space and
  // the selection-ring offset is a consistent gap all the way around.
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {src && (
        <img
          src={src}
          alt=""
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'fill' }}
        />
      )}
    </div>
  )
}
