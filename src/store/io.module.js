import io from 'socket.io-client'

import { SOCKET_ENDPOINT } from "@/common/config"

import { APP_INIT } from '@/store/actions.type'
import {
    BALANCE_UPDATE,
    BOOK, MARKETS, ORDER, POSITION,
    SOCKET_CONNECTED, CHAT_MESSAGE, SYMBOL_ACTIVE, TRADE, USER
} from '@/store/mutations.type'

const state = {
    socket: null,
    socketState: false,
    symbolSub: null
}

const actions = {
    [APP_INIT]() {
        state.socket = io(SOCKET_ENDPOINT)

        state.socket.on('connect', () => {
            this.commit(SOCKET_CONNECTED)
        })
    }
}

const mutations = {
    [SOCKET_CONNECTED]() {
        state.socketState = true

        if (state.symbolSub) {
            state.socket.emit('subscribe', {
                topic: 'crypto_margin:orderbook@'+state.symbolSub
            })
            state.socket.emit('subscribe', {
                topic: 'crypto_margin:trade@'+state.symbolSub
            })
        }

        state.socket.emit('subscribe', {
            topic: 'crypto_margin:markets'
        })

        state.socket.emit('subscribe', {
            topic: 'trollbox'
        })

        state.socket.off('crypto_margin:trade').on('crypto_margin:trade', trade => {
            this.commit(TRADE, trade)
        })
        state.socket.off('crypto_margin:orderbook').on('crypto_margin:orderbook', book => {
            this.commit(BOOK, book)
        })
        state.socket.off('crypto_margin:markets').on('crypto_margin:markets', markets => {
            this.commit(MARKETS, markets)
        })
        state.socket.off('crypto_margin:order').on('crypto_margin:order', order => {
            this.commit(ORDER, order)
        })
        state.socket.off('crypto_margin:position').on('crypto_margin:position', position => {
            this.commit(POSITION, position)
        })
        state.socket.off('crypto_margin:balance').on('crypto_margin:balance', balance => {
            this.commit(BALANCE_UPDATE, balance)
        })
        state.socket.off('trollbox_message').on('trollbox_message', message => {
            this.commit(CHAT_MESSAGE, message)
        })
    },

    [USER](context, user) {
        state.socketState = false

        state.socket.destroy()

        state.socket = io(SOCKET_ENDPOINT, {
            query: {
                Authorization: user.jwt_token
            }
        })

        state.socket.on('connect', () => {
            this.commit(SOCKET_CONNECTED)
        })
    },

    [SYMBOL_ACTIVE](context, symbol) {
        if (symbol !== state.symbolSub) {
            if (state.socketState) {
                if (state.symbolSub) {
                    state.socket.emit('unsubscribe', {
                        topic: 'crypto_margin:orderbook@'+state.symbolSub
                    })
                    state.socket.emit('unsubscribe', {
                        topic: 'crypto_margin:trade@'+state.symbolSub
                    })
                }

                state.socket.emit('subscribe', {
                    topic: 'crypto_margin:orderbook@'+symbol
                })
                state.socket.emit('subscribe', {
                    topic: 'crypto_margin:trade@'+symbol
                })
            }
        }

        state.symbolSub = symbol
    }
}

export default {
    state,
    actions,
    mutations
}
