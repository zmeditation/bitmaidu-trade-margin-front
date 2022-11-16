<template>
    <div class="modal-wrapper"
         v-bind:class="modalCalculatorActive ? '' : 'hide'"
         v-on:click.stop="hideModal()">
        <div class="modal" v-on:click.stop>
            <div class="modal-header">
                <h5>{{ tokens.Calculator }} ({{markets[this.symbolActive] ? markets[this.symbolActive].alias : ''}}) <i class="material-icons close" v-on:click.stop="hideModal">close</i> </h5>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="tabs">
                    <span
                        v-bind:class="{active: tabActive === 'pnl'}"
                        v-on:click="tabActive = 'pnl'"
                    >{{ tokens.ProfitLoss }}</span>
                        <span
                            v-bind:class="{active: tabActive === 'priceTarget'}"
                            v-on:click="tabActive = 'priceTarget'"
                        >{{ tokens.TargetPrice }}</span>
                        <span
                            v-bind:class="{active: tabActive === 'priceLiq'}"
                            v-on:click="tabActive = 'priceLiq'"
                        >{{ tokens.LiquidationPrice }}</span>
                    </div>
                </div>
                <div class="form-row" v-bind:class="{hide: tabActive !== 'pnl'}">
                    <div class="two-cols">
                        <div class="onecol">
                            <div class="val-row">
                                <label>{{ tokens.Side }}</label>
                                <select v-model="pnl.side">
                                    <option value="1">{{ tokens.Long }}</option>
                                    <option value="-1">{{ tokens.Short }}</option>
                                </select>
                            </div>
                            <div class="val-row">
                                <label>{{ tokens.Amount }}</label>
                                <input v-model="pnl.amount"/>
                            </div>
                            <div class="val-row">
                                <label>{{ tokens.EntryPrice }}</label>
                                <input v-model="pnl.entry"/>
                            </div>
                            <div class="val-row">
                                <label>{{ tokens.ClosePrice }}</label>
                                <input v-model="pnl.close"/>
                            </div>
                            <div class="val-row">
                                <label>{{ tokens.Leverage }}</label>
                                <input v-model="pnl.leverage"/>
                            </div>
                        </div>
                        <div class="onecol">
                            <table>
                                <tbody>
                                    <tr>
                                        <td>{{ tokens.Margin }}</td>
                                        <td>{{pnlVals.margin.toFixed(account.precision)+' '+markets[this.symbolActive].base_currency}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{ tokens.InitialQuantity }}</td>
                                        <td>{{pnlVals.qtyInit.toFixed(account.precision)+' '+markets[this.symbolActive].base_currency}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{ tokens.FinalQuantity }}</td>
                                        <td>{{pnlVals.qtyFinal.toFixed(account.precision)+' '+markets[this.symbolActive].base_currency}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{ tokens.ProfitLoss }}</td>
                                        <td>{{pnlVals.pnl.toFixed(account.precision)+' '+markets[this.symbolActive].base_currency}}</td>
                                    </tr>
                                    <tr>
                                        <td>{{ tokens.ProfitLoss }} %</td>
                                        <td>{{pnlVals.pnlPct.toFixed(2)}}%</td>
                                    </tr>
                                    <tr>
                                        <td>{{ tokens.ROE }} %</td>
                                        <td>{{pnlVals.roe.toFixed(2)}}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="form-row" v-bind:class="{hide: tabActive !== 'priceTarget'}">
                    <div class="two-cols">
                        <div class="onecol">
                            <div class="val-row">
                                <label>{{ tokens.Side }}</label>
                                <select v-model="target.side">
                                    <option value="1">{{ tokens.Long }}</option>
                                    <option value="-1">{{ tokens.Short }}</option>
                                </select>
                            </div>
                            <div class="val-row">
                                <label>{{ tokens.Leverage }}</label>
                                <input v-model="target.leverage"/>
                            </div>
                            <div class="val-row">
                                <label>{{ tokens.EntryPrice }}</label>
                                <input v-model="target.entry"/>
                            </div>
                            <div class="val-row">
                                <label>{{ tokens.ROE }}</label>
                                <input v-model="target.roe"/>
                            </div>
                        </div>
                        <div class="onecol">
                            <table>
                                <tbody>
                                <tr>
                                    <td>{{ tokens.EntryPrice }}</td>
                                    <td>{{targetVals.entry.toFixed(markets[this.symbolActive] ? markets[this.symbolActive].precision : 0)}}</td>
                                </tr>
                                <tr>
                                    <td>{{ tokens.TargetPrice }}</td>
                                    <td>{{targetVals.target.toFixed(markets[this.symbolActive] ? markets[this.symbolActive].precision : 0)}}</td>
                                </tr>
                                <tr>
                                    <td>{{ tokens.ProfitLoss }} %</td>
                                    <td>{{targetVals.pnlPct.toFixed(2)}}%</td>
                                </tr>
                                <tr>
                                    <td>{{ tokens.ROE }} %</td>
                                    <td>{{targetVals.roe.toFixed(2)}}%</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="form-row" v-bind:class="{hide: tabActive !== 'priceLiq'}">
                    <div class="two-cols">
                        <div class="onecol">
                            <div class="val-row">
                                <label>{{ tokens.Side }}</label>
                                <select v-model="liq.side">
                                    <option value="1">{{ tokens.Long }}</option>
                                    <option value="-1">{{ tokens.Short }}</option>
                                </select>
                            </div>
                            <div class="val-row">
                                <label>{{ tokens.Margin }}</label>
                                <select v-model="liq.margin">
                                    <option value="0">{{ tokens.Cross }}</option>
                                    <option value="1">{{ tokens.Isolated }}</option>
                                </select>
                            </div>
                            <div class="val-row">
                                <label>{{ tokens.Quantity }}</label>
                                <input v-model="liq.amount"/>
                            </div>
                            <div class="val-row">
                                <label>{{ tokens.EntryPrice }}</label>
                                <input v-model="liq.entry"/>
                            </div>
                            <div class="val-row" v-bind:class="{hide: liq.margin === '1'}">
                                <label>{{ tokens.Balance }}</label>
                                <input v-model="liq.balance"/>
                            </div>
                            <div class="val-row" v-bind:class="{hide: liq.margin === '0'}">
                                <label>{{ tokens.Leverage</label>
                                <input v-model="liq.leverage"/>
                            </div>
                        </div>
                        <div class="onecol">
                            <table>
                                <tbody>
                                <tr>
                                    <td>{{ tokens.CurrentMargin }}</td>
                                    <td>{{liqVals.margin.toFixed(account.precision)+' '+account.currency}}</td>
                                </tr>
                                <tr>
                                    <td>{{ tokens.FinalMargin }}</td>
                                    <td>{{liqVals.marginFinal.toFixed(account.precision)+' '+account.currency}}</td>
                                </tr>
                                <tr>
                                    <td>{{ tokens.LiquidationPrice }}</td>
                                    <td>{{liqVals.price.toFixed(markets[this.symbolActive] ? markets[this.symbolActive].precision : 0)}}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import {MODAL_CALCULATOR} from "@/store/mutations.type";

    export default {
        name: "Calculator",
        data() {
            return {
                tabActive: 'pnl',
                pnl: {
                    amount: '',
                    entry: '',
                    close: '',
                    leverage: '',
                    side: 1
                },
                target: {
                    roe: '',
                    entry: '',
                    leverage: '',
                    side: 1
                },
                liq: {
                    balance: '',
                    entry: '',
                    leverage: '',
                    amount: '',
                    side: 1,
                    margin: '0'
                }
            }
        },
        methods : {
            hideModal() {
                this.$store.commit(MODAL_CALCULATOR, false);
            }
        },
        computed: {
            ...mapGetters(['tokens', 'modalCalculatorActive', 'markets', 'symbolActive', 'account', 'margin']),
            pnlVals() {
                let vals = {
                    margin: 0,
                    qtyInit: 0,
                    qtyFinal: 0,
                    pnl: 0,
                    pnlPct: 0,
                    roe: 0
                }

                if (!this.markets[this.symbolActive]) {
                    return vals
                }

                // let accDivider = 1
                // if (this.markets[this.symbolActive].base_currency === this.markets[this.symbolActive].base_currency) {
                //     accDivider *= 1
                // } else if (this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency] !== undefined && this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency].quote !== undefined) {
                //     accDivider = this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency].quote.bid
                // } else if (this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency] !== undefined && this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency].quote !== undefined) {
                //     accDivider /= this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency].quote.bid
                // }
                //
                // vals.margin = this.pnl.amount * this.pnl.entry * accDivider / this.pnl.leverage
                // vals.margin = this.pnl.amount * this.pnl.entry * accDivider / this.pnl.leverage
                //
                // vals.qtyInit = this.pnl.amount * this.pnl.entry * accDivider
                // vals.qtyFinal = this.pnl.amount * this.pnl.close * accDivider

                vals.margin = this.pnl.amount / this.pnl.leverage
                vals.margin = this.pnl.amount / this.pnl.leverage

                vals.qtyInit = parseFloat(this.pnl.amount)
                vals.qtyFinal = this.pnl.amount * (1 + ((this.pnl.close - this.pnl.entry) / this.pnl.entry))

                vals.pnl = this.pnl.side * (vals.qtyFinal - vals.qtyInit)
                vals.pnlPct = 100 * vals.pnl / vals.qtyInit

                vals.roe = vals.pnlPct * this.pnl.leverage

                for(let n in vals) {
                    if (isNaN(vals[n]) || !isFinite(vals[n])) {
                        vals[n] = 0
                    }
                }

                return vals
            },
            targetVals() {
                let vals = {
                    entry: 0,
                    target: 0,
                    pnlPct: 0,
                    roe: 0
                }

                vals.entry = parseFloat(this.target.entry)
                vals.roe = parseFloat(this.target.roe)
                vals.pnlPct = this.target.roe / this.target.leverage

                vals.target = vals.entry + this.target.side * (this.target.entry / (1 - (vals.pnlPct / 100)) - this.target.entry)

                for(let n in vals) {
                    if (isNaN(vals[n]) || !isFinite(vals[n])) {
                        vals[n] = 0
                    }
                }

                return vals
            },
            liqVals() {
                let vals = {
                    price: 0,
                    margin: 0,
                    marginFinal: 0
                }

                if (!this.markets[this.symbolActive]) {
                    return vals
                }

                let accDivider = 1
                if (this.markets[this.symbolActive].base_currency === this.markets[this.symbolActive].base_currency) {
                    accDivider *= 1
                } else if (this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency] !== undefined && this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency].quote !== undefined) {
                    accDivider = this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency].quote.bid
                } else if (this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency] !== undefined && this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency].quote !== undefined) {
                    accDivider /= this.markets[this.markets[this.symbolActive].base_currency+this.markets[this.symbolActive].base_currency].quote.bid
                }

                if (this.liq.margin === '1') {
                    vals.margin = (this.liq.amount / this.liq.entry) * accDivider / this.liq.leverage
                    vals.marginFinal = vals.margin

                    vals.price = parseFloat(this.liq.entry) - this.liq.entry * this.liq.side * (1 / this.liq.leverage)
                } else {
                    vals.margin = this.margin.margin
                    vals.marginFinal = vals.margin + (this.liq.amount / this.liq.entry) * accDivider / this.account.leverage

                    vals.price = this.liq.entry - this.liq.entry * this.liq.side * (this.liq.balance - (vals.marginFinal * 0.1)) / this.liq.balance
                }

                for(let n in vals) {
                    if (isNaN(vals[n]) || !isFinite(vals[n])) {
                        vals[n] = 0
                    }
                }

                return vals
            }
        },
        watch: {
            modalCalculatorActive(val, old) {
                if (val && !old) {
                    this.pnl.amount = 1
                    this.pnl.entry = this.markets[this.symbolActive].price
                    this.pnl.close = this.markets[this.symbolActive].price
                    this.pnl.leverage = this.account.leverage
                    this.pnl.side = 1

                    this.target.entry = this.markets[this.symbolActive].price
                    this.target.leverage = this.account.leverage
                    this.target.roe = 10
                    this.target.side = 1

                    this.liq.amount = 1
                    this.liq.entry = this.markets[this.symbolActive].price
                    this.liq.leverage = this.account.leverage
                    this.liq.side = 1
                    this.liq.margin = '0'
                }
            }
        }
    }
</script>

<style scoped>
    .modal {
        width: 500px;
    }

    .val-row {
        display: flex;
        justify-content: center;
        margin: 0 0 15px;
    }

    .val-row label {
        margin: 0 15px 0 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    td {
        width: 50%;
    }

    td:first-child {
        text-align: right;
        color: var(--secondary-button)
    }
</style>