import { showNotification } from '@mantine/notifications'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import * as Sentry from '@sentry/browser'
import { APIMapping } from 'hoshimi-types'
import { useQuery } from 'react-query'

import { APIResponseOf, GetFirst, LengthOf } from './api'

function useApi<T extends keyof APIMapping>(
    key: T,
    params?: LengthOf<Parameters<APIMapping[T]>> extends 0
        ? undefined
        : GetFirst<Parameters<APIMapping[T]>>
) {
    const urlsp = new URLSearchParams()
    let withParams = false
    Object.entries(params ?? {}).map(([k, v]) => {
        withParams = true
        urlsp.set(k, String(v))
    })
    const rq = useQuery<APIResponseOf<T>>({
        queryKey: key + (withParams ? '?' + urlsp.toString() : ''),
        onError: (error) => {
            showNotification({
                color: 'red',
                title: `于 ${key} API 获取数据时出错`,
                icon: <FontAwesomeIcon icon={faCircleXmark} />,
                message: String(error),
            })
            console.error(error)
            Sentry.captureException(error)
        },
    })

    return rq
}

export default useApi
