import Vue from 'vue';
import {
    ACCOUNT, BALANCE_UPDATE,
    HISTORY,
    HISTORY_LENGTH,
    LOGOUT, NOTIFICATION,
    ORDER,
    POSITION, POSITIONS_HISTORY, POSITIONS_HISTORY_LENGTH,
    SYMBOL_ACTIVE, TRADE, TRADE_CONFIG,
    TRADES_FULL,
    USER
} from "@/store/mutations.type";
import RestService from "@/common/rest.service";
import {
    APP_INIT,
    HISTORY_REQUEST,
    ORDER_CANCEL,
    ORDER_REQUEST,
    POSITION_LEVERAGE_REQUEST,
    POSITIONS_HISTORY_REQUEST
} from "@/store/actions.type";

const state = {
    account: {
        id: 0,
        leverage: 100,
        precision: 4,
        balance: 0,
        currency: 'BTC'
    },
    tradeConfig: {
        taker_fee: 0.0075,
        maker_fee: -0.0025,
        funding_shift: 0,
        funding_period: 0,
        funding_rate: 0
    },
    orders: {},
    positions: {},
    trades: [],
    history: [],
    positionsHistory: [],
    historyLen: 0,
    positionsHistoryLen: 0
}

const getters = {
    account() {
        return state.account
    },

    orders() {
        return state.orders
    },

    positions() {
        return state.positions
    },

    trades() {
        return state.trades
    },

    history() {
        return state.history
    },

    positionsHistory() {
        return state.positionsHistory
    },

    historyLen() {
        return state.historyLen
    },

    positionsHistoryLen() {
        return state.positionsHistoryLen
    },

    tradeConfig() {
        return state.tradeConfig
    },

    margin() {
        let margin = {
            margin: 0,
            marginLevel: 0,
            equity: state.account.balance,
            balance: state.account.balance,
            available: state.account.balance
        }

        for(let i in state.orders) {
            // margin.margin += state.orders[i].margin
            margin.margin += Math.abs(state.orders[i].quantity)
            margin.available -= Math.abs(state.orders[i].quantity)
        }

        for(let i in state.positions) {
            // margin.margin += state.positions[i].margin
            margin.margin += Math.abs(state.positions[i].quantity)
            margin.available -= Math.abs(state.positions[i].quantity)
        }

        margin.marginLevel = margin.margin ? margin.equity * 100 / margin.margin : 0
        margin.available = Math.max(0, margin.available)

        return margin
    }
}

const actions = {
    [APP_INIT]() {
        RestService.get('/crypto_margin/config')
            .then(conf => {
                this.commit(TRADE_CONFIG, conf)
            })
    },

    [ORDER_REQUEST](context, order) {
        order.account_id = state.account.id
        RestService.post('/crypto_margin/'+state.account.id+'/orders', order)
    },

    [ORDER_CANCEL](context, order) {
        order.account_id = state.account.id
        RestService.delete('/crypto_margin/'+state.account.id+'/orders/'+order.id)
    },

    [POSITION_LEVERAGE_REQUEST](context, position) {
        position.account_id = state.account.id
        RestService.put('/crypto_margin/'+state.account.id+'/position/'+position.id+'/leverage', position)
            .then(() => {
                this.commit(NOTIFICATION, 'Position leverage has been set to '+position.leverage)
            })
    },

    [HISTORY_REQUEST](context, page) {
        RestService.get('/crypto_margin/'+state.account.id+'/orders/history?limit=10&offset='+page*10)
            .then(orders => {
                for(let i in orders.orders) {
                    this.commit(HISTORY, orders.orders[i])
                }
            })
    },

    [POSITIONS_HISTORY_REQUEST](context, page) {
        RestService.get('/crypto_margin/'+state.account.id+'/positions/history?limit=10&offset='+page*10)
            .then(positions => {
                for(let i in positions.positions) {
                    this.commit(POSITIONS_HISTORY, positions.positions[i])
                }
            })
    }
}

const mutations = {
    [USER]() {
        RestService.get('/crypto_margin/accounts')
            .then(accounts => {
                for(let i in accounts) {
                    this.commit(ACCOUNT, accounts[i])
                }
            })
    },

    [ACCOUNT](context, account) {
        state.account = account

        RestService.get('/crypto_margin/'+account.id+'/orders')
            .then(orders => {
                for(let i in orders) {
                    this.commit(ORDER, orders[i])
                }
            })

        RestService.get('/crypto_margin/'+account.id+'/positions')
            .then(positions => {
                for(let i in positions) {
                    this.commit(POSITION, positions[i])
                }
            })

        RestService.get('/crypto_margin/'+account.id+'/orders/history')
            .then(orders => {
                for(let i in orders.orders) {
                    this.commit(HISTORY, orders.orders[i])
                }
                this.commit(HISTORY_LENGTH, orders.total)
            })

        RestService.get('/crypto_margin/'+account.id+'/positions/history')
            .then(positions => {
                for(let i in positions.positions) {
                    this.commit(POSITIONS_HISTORY, positions.positions[i])
                }
                this.commit(POSITIONS_HISTORY_LENGTH, positions.total)
            })

        RestService.get('/crypto_margin/'+account.id+'/trades')
            .then(trades => {
                for(let i in trades) {
                    this.commit(TRADES_FULL, trades[i])
                }
            })
    },

    [SYMBOL_ACTIVE](context, symbol) {
        if (!state.account.id) {
            return
        }

        RestService.get('/crypto_margin/'+state.account.id+'/trades?symbol='+symbol)
            .then(trades => {
                this.commit(TRADES_FULL, trades)
            })

        state.symActive = symbol
    },

    [ORDER](context, order) {
        switch (order.status) {
            case 'NEW':
                return
            case 'ACTIVE':
                this.commit(NOTIFICATION, 'Order #'+order.id.split('-')[0]+' '+(order.side ? 'Buy' : 'Sell')+' '+order.quantity+' '+order.symbol+' is active')
                Vue.set(state.orders, order.id, order)
                break
            case 'PARTIALLY_FILLED':
                this.commit(NOTIFICATION, 'Order #'+order.id.split('-')[0]+' '+(order.side ? 'Buy' : 'Sell')+' '+order.quantity_filled+'/'+order.quantity+' '+order.symbol+' partially filled')
                Vue.set(state.orders, order.id, order)
                break
            case 'FILLED':
                this.commit(NOTIFICATION, 'Order #'+order.id.split('-')[0]+' '+(order.side ? 'Buy' : 'Sell')+' '+order.quantity+' '+order.symbol+' is filled')

                Vue.delete(state.orders, order.id)

                state.history.unshift(order)
                state.historyLen++

                break
            case 'CANCELLED':
                this.commit(NOTIFICATION, 'Order #'+order.id.split('-')[0]+' '+(order.side ? 'Buy' : 'Sell')+' '+order.quantity+' '+order.symbol+' is cancelled')

                Vue.delete(state.orders, order.id)

                state.history.unshift(order)
                state.historyLen++

                break
            default:
                return
        }
    },

    [POSITION](context, position) {
        if (position.leverage === 0) {
            if (position.quantity === 0) {
                Vue.delete(state.positions, position.symbol)
            } else {
                Vue.set(state.positions, position.symbol, position)
            }
        } else {
            if (position.quantity === 0) {
                Vue.delete(state.positions, position.id)
            } else {
                Vue.set(state.positions, position.id, position)
            }
        }
    },

    [TRADES_FULL](context, trades) {
        Vue.set(state, 'trades', trades)
    },

    [TRADE](context, trade) {
        if (trade.maker_id !== state.account.id && trade.taker_id !== state.account.id) {
            return
        }

        let nTrade = {
            ...trade
        }

        if (nTrade.maker_id === state.account.id) {
            nTrade.side = nTrade.side ? 0 : 1
        }

        state.trades.unshift(nTrade)
        state.trades = state.trades.slice(0, 20)

        Vue.set(state, 'trades', state.trades)
    },

    [HISTORY](context, order) {
        let res = state.history.filter(obj => {
            return obj.id === order.id
        })

        if (res.length) {
            return
        }

        state.history.push(order)
        state.history.sort((a, b) => {
            return a.time_closed < b.time_closed ? 1 : (a.time_closed > b.time_closed ? -1 : 0)
        })
    },

    [POSITIONS_HISTORY](context, position) {
        let res = state.positionsHistory.filter(obj => {
            return obj.id === position.id
        })

        if (res.length) {
            return
        }

        state.positionsHistory.push(position)
        state.positionsHistory.sort((a, b) => {
            return a.time_close < b.time_close ? 1 : (a.time_close > b.time_close ? -1 : 0)
        })
    },

    [HISTORY_LENGTH](context, total) {
        state.historyLen = total
    },

    [POSITIONS_HISTORY_LENGTH](context, total) {
        state.positionsHistoryLen = total
    },

    [BALANCE_UPDATE](context, balance) {
        state.account.balance += (balance.amount * Math.pow(0.1, state.account.precision))
    },

    [TRADE_CONFIG](context, config) {
        state.tradeConfig = config
    },

    [LOGOUT]() {
        state.account = {
            leverage: 100,
            precision: 4,
            balance: 0,
            currency: 'BTC'
        }

        Vue.set(state, 'orders', {})
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
