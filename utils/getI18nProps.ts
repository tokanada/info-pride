const getI18nProps =
    (sources: string[] = []) =>
    async ({ locale }: { locale: string }) => {
        return {
            props: {
                ...(await addI18nMessages(locale, sources)),
            },
        }
    }

export const addI18nMessages = async (
    locale: string,
    sources: string[] = []
) => {
    const _m: Record<string, any> = {}
    for (const i of [...sources, 'common']) {
        _m[i] = (await import(`../locales/${locale}/${i}.json`)).default
    }
    return {
        _m,
    }
}

export default getI18nProps
