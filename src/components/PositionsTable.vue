<template>
    <div v-bind:class="{hide: !loggedIn || hideTable}">
        <span class="pad-top">{{ tokens.CrossMargin }}</span>
        <table>
            <thead>
            <tr>
                <th>{{ tokens.Market }}</th>
                <th>{{ tokens.Price }}</th>
                <th>{{ tokens.Quantity }}</th>
                <th>{{ tokens.MarketPrice }}</th>
                <th>{{ tokens.LiqPrice }}</th>
                <th>{{ tokens.ProfitLoss }}</th>
                <th>{{ tokens.ClosePosition }}</th>
            </tr>
            </thead>
            <tbody>
            <template inline-template>
                <tr v-for="position in positions"
                    v-bind:key="'pos'+position.id"
                    v-on:click="changeSymbol(position.symbol)"
                    v-bind:class="{hide: position.leverage > 0}"
                >
                    <td>
                    <span class="frow">
                        <i class="material-icons" v-bind:class="position.quantity > 0 ? 'green' : 'red'">{{ position.quantity > 0 ? 'expand_less' : 'expand_more' }}</i>
                        <span>{{ position.quantity > 0 ? 'LONG' : 'SHORT' }} {{ position.symbol }}</span>
                    </span>
                    </td>
                    <td>{{ position.price.toFixed(markets[position.symbol].precision) }}</td>
                    <td>{{ Math.abs(position.quantity).toFixed(account.precision)+' '+markets[position.symbol].foreign_currency }}</td>
                    <td v-bind:class="markets[position.symbol].quote.changeDir > 0 ? 'green' : (markets[position.symbol].quote.changeDir < 0 ? 'red' : '')">{{ markets[position.symbol].quote && markets[position.symbol].quote.bid ? markets[position.symbol].quote.bid.toFixed(markets[position.symbol].precision) : 0}}</td>
                    <td>{{ (position.price_liq === 999999 ? '>' : '')+(position.price_liq >= 0 ? position.price_liq : 0).toFixed(markets[position.symbol].precision) }}</td>
                    <td>{{ ((position.quantity > 0 ? 1 : -1) * position.point * Math.pow(0.1, 8 - markets[position.symbol].precision) * (markets[position.symbol].quote.bid - position.price) / Math.pow(0.1, markets[position.symbol].precision)).toFixed(account.precision)+' '+account.currency }} (ROE {{ ((position.quantity > 0 ? 1 : -1) * (markets[position.symbol].quote.bid - position.price) * 100 / position.price).toFixed(2) }}%)</td>
                    <td>
                        <span class="frow">
                            <input type="text" placeholder="Quantity" v-model="closeQty"/>
                            <span class="btn btn-primary" v-on:click.stop="closePosition(position.symbol)">{{ tokens.Close }}</span>
                        </span>
                    </td>
                </tr>
            </template>
            </tbody>
        </table>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';
import {ORDER_REQUEST} from "@/store/actions.type";
import {SYMBOL_ACTIVE} from "@/store/mutations.type";
export default {
    name: "PositionsTable",
    data() {
        return {
            closeQty: ''
        }
    },
    computed: {
        ...mapGetters(['tokens', 'loggedIn', 'positions', 'markets', 'account']),
        hideTable() {
            let show = false
            for(let i in this.positions) {
                if (this.positions[i].leverage === 0) {
                    show = true
                }
            }

            return !show
        }
    },
    methods: {
        closePosition(symbol) {
            let qty = parseFloat(this.closeQty)

            if (isNaN(qty) || !qty) {
                qty = Math.abs(this.positions[symbol].quantity)
            }

            this.$store.dispatch(ORDER_REQUEST, {
                symbol,
                side: this.positions[symbol].quantity > 0 ? 0 : 1,
                type: 'MARKET',
                quantity: qty
            })
        },
        changeSymbol(symbol) {
            this.$store.commit(SYMBOL_ACTIVE, symbol)
        }
    }
}
</script>

<style scoped>
    th {
        background-color: rgba(255,255,255,0.05);
        border-right: 1px solid var(--background-dark);
    }

    .btn {
        padding: 0.15em 0.6em;
    }

    tr {
        cursor: pointer;
        transition: background-color 0.5s ease-in-out;
    }

    tr:hover {
        background-color: rgba(255,255,255,0.02);
    }

    input {
        width: auto;
        padding: 0.15em 0.6em;
        font-size: 0.8em;
        margin-right: 5px;
    }

    .frow {
        display: flex;
        align-items: center;
    }

    .pad-top {
        margin-top: 15px;
        display: flex;
    }
</style>
