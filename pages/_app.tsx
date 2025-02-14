import { AppProps } from 'next/app'
import Head from 'next/head'
import {
    ColorScheme,
    ColorSchemeProvider,
    Global,
    MantineProvider,
} from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import { NextIntlProvider } from 'next-intl'
import '../styles/globals.css' // for Tailwind CSS
import { useEffect, useState } from 'react'
import NextNProgress from 'nextjs-progressbar'
import { QueryClient, QueryClientProvider } from 'react-query'
import { GetServerSidePropsContext } from 'next'
import { getCookie, setCookie } from 'cookies-next'

import Layout from '#components/layout/Layout'
import startupHook from '#utils/startupHook'
import Paths from '#utils/paths'

const App = (
    props: AppProps<{ _m: Record<string, string> }> & {
        colorScheme: ColorScheme
    }
) => {
    const { Component, pageProps } = props

    const [colorScheme, setColorScheme] = useState<ColorScheme>(
        props.colorScheme
    )

    const toggleColorScheme = (value?: ColorScheme) => {
        const nextColorScheme =
            value || (colorScheme === 'dark' ? 'light' : 'dark')
        setColorScheme(nextColorScheme)
        setCookie('mantine-color-scheme', nextColorScheme, {
            maxAge: 60 * 60 * 24 * 30,
        })
    }

    useEffect(() => {
        startupHook()
    }, [])

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: Infinity,
                        queryFn: ({ queryKey: [path] }) => {
                            if (typeof path === 'string') {
                                const url = new URL(Paths.api(path))
                                return fetch(String(url)).then((x) => x.json())
                            }
                            throw new Error('Invalid QueryKey')
                        },
                    },
                },
            })
    )

    return (
        <>
            <Head>
                <title>INFO PRIDE</title>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width"
                />
            </Head>
            <ColorSchemeProvider
                colorScheme={colorScheme}
                toggleColorScheme={toggleColorScheme}
            >
                <Global
                    styles={(theme) => ({
                        a: {
                            color:
                                colorScheme === 'light'
                                    ? theme.colors.blue[7]
                                    : theme.colors.blue[3],
                        },
                    })}
                />
                <MantineProvider
                    withGlobalStyles
                    withNormalizeCSS
                    theme={{
                        breakpoints: {
                            sm: 640,
                            md: 768,
                            lg: 1024,
                            xl: 1280,
                        },
                        colorScheme,
                        fontFamily:
                            '-apple-system, system-ui, "Segoe UI", "Helvetica Neue", Arial, "Hiragino Sans GB", "PingFang SC", "Heiti SC", "Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei UI", "Microsoft YaHei", sans-serif',
                        components: {
                            ActionIcon: {
                                styles: (theme) => {
                                    {
                                        return {
                                            root: {
                                                '&:not(:disabled):active': {
                                                    transform: 'none',
                                                },
                                            },
                                            default: {
                                                '&:not(:disabled):active': {
                                                    backgroundColor:
                                                        theme.colors[
                                                            theme.primaryColor
                                                        ][8],
                                                },
                                            },
                                        }
                                    }
                                },
                            },
                            Button: {
                                styles: (theme) => {
                                    const color = theme.primaryColor
                                    return {
                                        root: {
                                            '&:not(:disabled):active': {
                                                transform: 'none',
                                            },
                                        },
                                        outline: {
                                            '&:not(:disabled):active': {
                                                backgroundColor:
                                                    theme.colors[color][2],
                                            },
                                        },
                                        filled: {
                                            '&:not(:disabled):hover': {
                                                backgroundColor:
                                                    theme.colors[color][4],
                                            },
                                            '&:not(:disabled):active': {
                                                backgroundColor:
                                                    theme.colors[color][8],
                                            },
                                        },
                                    }
                                },
                            },
                        },
                    }}
                >
                    <NotificationsProvider>
                        <QueryClientProvider client={queryClient}>
                            <NextIntlProvider
                                messages={pageProps._m}
                                getMessageFallback={({ key }) => key}
                            >
                                <Layout>
                                    <NextNProgress />
                                    <Component {...pageProps} />
                                </Layout>
                            </NextIntlProvider>
                        </QueryClientProvider>
                    </NotificationsProvider>
                </MantineProvider>
            </ColorSchemeProvider>
        </>
    )
}

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
    colorScheme: getCookie('mantine-color-scheme', ctx) || 'light',
})

export default App
