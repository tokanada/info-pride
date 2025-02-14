import { Button } from '@mantine/core'
import _range from 'lodash/range'

import { toVideoLink } from '#components/ExternalVideo'
import { Stories } from '#data/types'

const CardStories = ({ stories }: { stories: Stories }) => (
    <div className="mb-2">
        {_range(3)
            .map((x) => x + 1)
            .map((id) => {
                const _id = id as unknown as 1 | 2 | 3
                const storyName = ['', 'TODO'].includes(stories[_id].name)
                    ? `剧情第${_id}话`
                    : `${_id} - ${stories[_id].name}`
                return (
                    <Button
                        key={id}
                        component="a"
                        href={toVideoLink(stories[_id].video)}
                        target="_blank"
                        rel="noopener"
                        className="mr-2"
                    >
                        {storyName}
                    </Button>
                )
            })}
        {stories.phone && (
            <Button
                component="a"
                href={toVideoLink(stories.phone.video)}
                target="_blank"
                rel="noopener"
            >
                来电
            </Button>
        )}
    </div>
)

export default CardStories
