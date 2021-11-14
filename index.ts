import { API, getRandomId, VK } from 'vk-io'
import { config } from './config'
import { randomInt } from 'crypto'
import { CronJob } from 'cron'
import { APIMessages } from './node_modules/vk-io/lib/api/schemas/methods'

function getRandomSticker(): number {
    const list: number[] = [
        //good night
        58634, 6750, 61411, 62805, 62448, 62272, 60710, 60105,
        58257, 57640, 15627, 13645, 59246, 51307, 18992, 53752,
        53569, 50458, 57191, 58161, 58834, 11280, 53001, 58017,
        52909, 18258, 18227, 17729, 53476, 53480,

        //heart
        58613, 14087, 63445, 53095, 53099, 62297, 63070, 62796,
        62795, 62809, 62792, 59652, 59668, 59649, 59673, 59690,
        58232, 58620, 57630, 57638, 57648, 57645, 19460, 19443,
        19453, 15595, 15617, 13644, 13604, 13607,

        //some another
        62790, 62251, 62252, 62269, 62294, 61408, 61415, 3872,
        3873, 3874, 3875, 3877, 3880, 3881, 3888, 3892, 3891,
        3917, 7472, 7473, 7474, 11255, 11256, 17723, 18958,
        17724, 17725, 17734, 17767, 57489, 57488, 57498, 57528,
        57155, 57176, 51557, 16689, 55348, 55350, 55352, 55386,
        54310, 54325, 16215, 16258, 13602, 18997, 19007, 18959,
        18481, 18491, 18487, 4236, 4237, 4238, 4239, 4241, 4258,
        18946, 18945, 18956, 18991, 4531
    ]

    const i = randomInt(0, list.length - 1 + 1)

    return list[i]
}

function getRandomText(): string {
    const list: string[] = [
        'Всем спокойной ночи',
        'Спокойной ночи',
        'Спокойной ночи малыши',
        'Спокойной ночки',
        'Доброй ночи',
        'Всем доброй ночи',
        'Сладких снов',
        'Всем сладких снов',
        'Выспитесь хорошенько',
        'Лёгкого засыпания и лёгкого пробуждения',
        'Всем лёгкого засыпания и лёгкого пробуждения',
        'Желаю отлично выспаться',
        'Всем желаю отлично выспаться',
        'Добрых снов',
        'Всем добрых снов',
        'Споки-ноки',
        'Всем споки',
        'Споки',
        'Встретимся во сне',
        'Освежающего сна',
        'Всем освежающего сна',
        'Сладкой ночи',
        'Всем сладкой ночи',
        'Мирной ночи',
        'Всем мирной ночи',
        'Лёгких снов',
        'Всем лёгких снов',
        'Красивых снов',
        'Всем красивых снов',
        'Сладких сновидений',
        'Всем сладких сновидений',

        'Ложитесь спать... Я приду, проверю!',

        'Желаю сладких, добрых снов, чтобы хорошенько выспаться, полноценно отдохнуть и проснуться в позитивном настроении на новый день. Спокойной ночи!',
        'Пускай сегодня был трудный день, не всегда все идет так, как мы мечтаем, но завтра будет новый день и новая возможность осуществить свои мечты. Спокойной ночи!',
    ]

    const i = randomInt(0, list.length - 1 + 1)

    return list[i]
}

function getRandomSmile(): string {
    const list: string[] = [
        ':)', ';)',
        '😉', '😊', '🙂', '🙃', '😚', '😘', '🤗', '❤', '💤'
    ]

    const i = randomInt(0, list.length - 1 + 1 + 1)

    if (i == 0) return '';

    return ' ' + list[i - 1]
}

interface ExtendedMessages extends APIMessages {
    markAsUnreadConversation(params: any): Promise<any>
}

interface ExtendedAPI extends API {
    messages: ExtendedMessages
}

interface ExtendedVK extends VK {
    api: ExtendedAPI
}

const vk = new VK({
    token: config.access_token,
    apiMode: 'parallel_selected',
    apiExecuteMethods: ['messages.send']
}) as ExtendedVK

async function startSend() {
    await vk.api.account.setOnline({})

    const chat = (await vk.api.messages.getConversationsById({ peer_ids: config.peerId })).items[0]

    await Promise.all([
        vk.api.messages.setActivity({ type: 'typing', peer_id: config.peerId }),
        new Promise(res => setTimeout(res, 5e3))
    ])

    await Promise.all([
        vk.api.messages.send({
            peer_id: config.peerId,
            random_id: getRandomId(),
            message: getRandomText() + getRandomSmile()
        }),
        vk.api.messages.send({
            peer_id: config.peerId,
            random_id: getRandomId(),
            sticker_id: getRandomSticker()
        })
    ])

    if (chat.unread_count && chat.is_marked_unread) await vk.api.messages.markAsUnreadConversation({ peer_id: config.peerId })

    await vk.api.account.setOffline({})
}

new CronJob('0 0 22 * * *', startSend, null, true).start()
