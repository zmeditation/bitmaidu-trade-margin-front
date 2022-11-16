<template>
    <div v-bind:class="{hide: !loggedIn}">
        <table>
            <thead>
            <tr>
                <th>{{ tokens.Market }}</th>
                <th>{{ tokens.Quantity }}</th>
                <th>{{ tokens.OpenPrice }}</th>
                <th>{{ tokens.ClosePrice }}</th>
                <th>{{ tokens.CloseTime }}</th>
                <th>{{ tokens.ProfitLoss }}</th>
            </tr>
            </thead>
            <tbody>
            <template inline-template>
                <tr v-for="position in positionsHistory"
                    v-bind:key="'pos'+position.id"
                    v-on:click="changeSymbol(position.symbol)"
                >
                    <td>
                    <span class="frow">
                        <i class="material-icons" v-bind:class="position.quantity > 0 ? 'green' : 'red'">{{ position.quantity > 0 ? 'expand_less' : 'expand_more' }}</i>
                        <span>{{ position.quantity > 0 ? 'LONG' : 'SHORT' }} {{ position.symbol }}</span>
                    </span>
                    </td>
                    <td>{{ Math.abs(position.quantity).toFixed(account.precision)+' '+markets[position.symbol].foreign_currency }}</td>
                    <td>{{ position.price_open.toFixed(markets[position.symbol].precision) }}</td>
                    <td>{{ position.price_close.toFixed(markets[position.symbol].precision) }}</td>
                    <td>{{ new Date(position.time_close).toLocaleString() }}</td>
                    <td>{{ getProfitLoss(position, markets) }}</td>
                </tr>
            </template>
            </tbody>
        </table>
        <div class="bottom-nav">
            <span class="btn"
                  v-bind:class="page > 0 ? 'btn-primary' : 'btn-disabled'"
                  v-on:click="prevPage"
            ><i class="material-icons">keyboard_arrow_left</i> {{ tokens.Prev }}</span>
            <span class="btn"
                  v-bind:class="page*10+10 < positionsHistoryLen ? 'btn-primary' : 'btn-disabled'"
                  v-on:click="nextPage"
            >{{ tokens.Next }} <i class="material-icons">keyboard_arrow_right</i></span>
        </div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';
import {SYMBOL_ACTIVE} from "@/store/mutations.type";
import {HISTORY_REQUEST} from "@/store/actions.type";
export default {
    name: "PositionHistoriesTable",
    data() {
        return {
            closeQty: '',
            page: 0
        }
    },
    methods: {
        prevPage() {
            if (this.page > 0) {
                this.page -= 1
            }
        },
        nextPage() {
            if (this.page*10 + 10 < this.positionsHistoryLen) {
                this.page += 1

                this.$store.dispatch(HISTORY_REQUEST, this.page)
            }
        },
        changeSymbol(symbol) {
            this.$store.commit(SYMBOL_ACTIVE, symbol)
        },
        getProfitLoss(position, markets){
            const profit = ((position.price_close.toFixed(markets[position.symbol].precision) - position.price_open.toFixed(markets[position.symbol].precision)) * position.quantity).toFixed(markets[position.symbol].precision)
            const symbol = position.symbol.replace(markets[position.symbol].foreign_currency,"").replace('m',"") //ETHUSDTm
            return profit + ' ' + symbol
        }

    },
    computed: {
        ...mapGetters(['tokens', 'loggedIn', 'positionsHistory', 'markets', 'account', 'positionsHistoryLen'])
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

.bottom-nav {
    display: flex;
    justify-content: flex-end;
}

.bottom-nav .btn {
    display: flex;
    align-items: center;
}

.btn i {
    font-size: 1em;
}

.bottom-nav .btn:first-child {
    padding-right: 15px;
}

.bottom-nav .btn:last-child {
    padding-left: 15px;
    margin-left: 15px;
}
</style>
