import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import Paths from '#utils/paths'

const AssetAudio = ({ id }: { id: string }) => {
    const $t = useTranslations('common')
    const aud = useRef<HTMLAudioElement | null>(null)
    const [playReady, setPlayReady] = useState(0)

    const errorCb = () => {
        setPlayReady(-1)
    }

    useEffect(() => {
        const cur = aud.current
        if (cur === null) return
        cur.load()
        setPlayReady(0)
    }, [id])

    useEffect(() => {
        const cb = () => {
            setPlayReady(1)
        }
        const cur = aud.current
        if (cur === null) return
        cur.addEventListener('loadeddata', cb)
        return () => {
            cur.removeEventListener('loadeddata', cb)
        }
    }, [aud, setPlayReady])

    return (
        <div className="text-gray-500">
            {playReady === 0 && (
                <div className="mb-1">[{$t('audio_loading')}]</div>
            )}
            {playReady === -1 && (
                <div className="mb-1">[{$t('audio_load_failed', { id })}]</div>
            )}
            <audio controls={playReady !== 0} ref={aud} onError={errorCb}>
                <source
                    src={Paths.assets('sud')(`${id}.opus`)}
                    type="audio/ogg; codecs=opus"
                />
                <source
                    src={Paths.assets('sud')(`${id}.mp3`)}
                    type="audio/mpeg"
                />
            </audio>
        </div>
    )
}

export default AssetAudio
