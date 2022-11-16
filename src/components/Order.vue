<template>
    <div class="order app-item">
        <h5>
            <span>{{ tokens.NewOrder }}</span>
            <div class="tabs">
            <span
                v-bind:class="{active: tabActive === 'limit'}"
                v-on:click="tabActive = 'limit'"
            >{{ tokens.Limit }}</span>
            <span
                v-bind:class="{active: tabActive === 'market'}"
                v-on:click="tabActive = 'market'"
            >{{ tokens.Market }}</span>
            <span
                v-bind:class="{active: tabActive === 'stop'}"
                v-on:click="tabActive = 'stop'"
            >{{ tokens.Stop }}</span>
            </div>
        </h5>
        <div class="form-row" v-bind:class="{hide: tabActive !== 'limit'}">
            <label>{{ tokens.Price }}</label>
            <input type="text" v-model="price"/>
            <span class="cur">{{ markets[symbolActive] ? markets[symbolActive].base_currency : ''}}</span>
        </div>
        <div class="form-row" v-bind:class="{hide: tabActive !== 'stop'}">
            <label>{{ tokens.StopPrice }}</label>
            <input type="text" v-model="stopPrice"/>
            <span class="cur">{{ markets[symbolActive] ? markets[symbolActive].base_currency : ''}}</span>
        </div>
        <div class="form-row">
            <label>{{ tokens.Amount }}</label>
            <input type="text" v-model="quantity"/>
            <span class="cur">{{ markets[symbolActive] ? markets[symbolActive].foreign_currency : '' }}</span>
        </div>
        <div class="form-row">
            <VueSlider class="slider"
                v-model="leverageSlider"
                :dragOnClick="true"
                :tooltip="'none'"
                :min="0"
                :max="100"
                :data="Array.from(new Array(401), (_, i) => Math.round(Math.pow(101, i/400)-1))"
                :marks="scale => marks(scale)"
            />
            <input class="leverage" v-model="leverageInput" />
        </div>
        <div class="form-row buttons">
            <span class="btn btn-sell" v-on:click="orderRequest(0)">{{ tokens.SELL }}</span>
            <span class="btn btn-buy" v-on:click="orderRequest(1)">{{ tokens.BUY }}</span>
        </div>
        <div class="form-row space-between">
            <h4>{{ tokens.TradeInformation }}</h4>
            <span class="btn btn-primary" v-on:click="showCalculator">{{ tokens.Calculator }}</span>
        </div>
        <div class="two-cols form-row">
            <div class="onecol">
                <span class="info"><span class="grey">{{ tokens.Leverage }}:</span><span>1:{{ leverage === 'Cross' || leverage == 0 ? account.leverage : orderLeverage }}</span></span>
                <span class="info"><span class="grey">{{ tokens.Margin }} {{leverage !== 'Cross' && leverage != 0 ? ' ('+tokens.isolated+')' : ''}}:</span><span>{{ orderMargin.toFixed(account.precision)+' '+account.currency}}</span></span>
            </div>
            <div class="onecol">
                <span class="info"><span class="grey">{{ tokens.OrderSize }}:</span><span>{{ orderSize.toFixed(account.precision)+' '+(markets[symbolActive] ? markets[symbolActive].base_currency : '')}}</span></span>
                <span class="info"><span class="grey">{{ tokens.Available }}:</span><span>{{ (Math.max(margin.available, 0)).toFixed(account.precision)+' '+account.currency}}</span></span>
            </div>
        </div>
        <div class="modal-wrapper"
             v-bind:class="modalOrderConfirmActive ? '' : 'hide'"
             v-on:click.stop="hideModal">
            <div class="modal" v-on:click.stop>
                <div class="modal-header">
                    <h5>{{ tokens.ConfirmOrder }} <i class="material-icons close" v-on:click.stop="hideModal">close</i> </h5>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <span class="confirmation-text">{{ confirmationText }}</span>
                    </div>
                    <div class="form-row checkbox-row">
                        <input type="checkbox" v-model="dontAsk">
                        <label>{{tokens.DontAsk }}</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary"
                            v-on:click="hideModal"
                    >{{ tokens.Cancel }}</button>
                    <button class="btn btn-primary"
                            v-on:click="confirm"
                    >{{ tokens.Confirm }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import {CONFIRM_ORDER, MODAL_CALCULATOR, MODAL_LOGIN, MODAL_ORDER_CONFIRM} from "@/store/mutations.type";
    import {ORDER_REQUEST} from "@/store/actions.type";
    import VueSlider from 'vue-slider-component'

    export default {
        name: "Order",
        components: {
            VueSlider
        },
        data() {
            return {
                tabActive: 'limit',
                quantity: 0,
                price: 0,
                stopPrice: 0,
                leverage: 0,
                leverages: ['Cross', '1x', '2x', '3x', '5x', '10x', '25x', '50x', '100x'],
                leverageInput: 0,
                leverageSlider: 0,
                leveragesVals: {
                    'Cross': 0,
                    '1x': 1,
                    '2x': 2,
                    '3x': 3,
                    '5x': 5,
                    '10x': 10,
                    '25x': 25,
                    '50x': 50,
                    '100x': 100
                },
                orderToConfirm: {
                    side: 0,
                    symbol: '',
                    type: 'LIMIT',
                    quantity: 0,
                    price: 0,
                    priceStop: 0,
                    leverage: 0
                },
                dontAsk: false
            }
        },
        methods: {
            orderRequest(side) {
                if (!this.loggedIn) {
                    this.$store.commit(MODAL_LOGIN, true)
                    return
                }

                let data = {
                    side,
                    symbol: this.symbolActive,
                    type: this.tabActive.toUpperCase(),
                    quantity: this.quantity
                }

                if (this.tabActive === 'limit') {
                    data.price = this.price
                }

                if (this.tabActive === 'stop') {
                    data.price_stop = this.stopPrice
                }

                data.leverage = this.orderLeverage

                if (this.confirmOrder) {
                    for(let n in data) {
                        this.orderToConfirm[n] = data[n]
                    }

                    this.$store.commit(MODAL_ORDER_CONFIRM, true)
                } else {
                    this.$store.dispatch(ORDER_REQUEST, data)
                }
            },
            showCalculator() {
                this.$store.commit(MODAL_CALCULATOR, true)
            },
            hideModal() {
                this.$store.commit(MODAL_ORDER_CONFIRM, false)
            },
            confirm() {
                this.$store.commit(MODAL_ORDER_CONFIRM, false)
                this.$store.dispatch(ORDER_REQUEST, this.orderToConfirm)

                if (this.dontAsk) {
                    this.$store.commit(CONFIRM_ORDER, false)
                }
            },
            marks(scale) {
                let scales = {
                    0: {
                        label: 'X'
                    },
                    1: {
                        label: '1'
                    },
                    2: {
                        label: '2'
                    },
                    3: {
                        label: '3'
                    },
                    5: {
                        label: '5'
                    },
                    10: {
                        label: '10'
                    },
                    25: {
                        label: '25'
                    },
                    50: {
                        label: '50'
                    },
                    100: {
                        label: '100'
                    }
                }

                return scales[scale] || ''
            }
        },
        computed: {
            ...mapGetters(['tokens', 'markets', 'symbolActive', 'account', 'loggedIn', 'margin', 'modalOrderConfirmActive', 'confirmOrder']),
            orderMargin() {
                if (!this.markets[this.symbolActive]) {
                    return 0
                }

                let margin = this.quantity,
                    price = this.tabActive === 'market' ? this.markets[this.symbolActive].quote.bid : this.price

                if (this.markets[this.symbolActive].base_currency === this.account.currency) {
                    margin *= price
                } else if (this.markets[this.markets[this.symbolActive].base_currency+this.account.currency] !== undefined && this.markets[this.markets[this.symbolActive].base_currency+this.account.currency].quote !== undefined) {
                    margin *= price * this.markets[this.markets[this.symbolActive].base_currency+this.account.currency].quote.bid
                } else if (this.markets[this.account.currency+this.markets[this.symbolActive].base_currency] !== undefined && this.markets[this.account.currency+this.markets[this.symbolActive].base_currency].quote !== undefined) {
                    margin *= price / this.markets[this.account.currency+this.markets[this.symbolActive].base_currency].quote.bid
                }

                return margin / (this.leverage === 'Cross' || this.leverage == 0 ? 1 : this.orderLeverage)
            },
            orderLeverage() {
                return this.leverageInput
            },
            orderSize() {
                switch (this.tabActive) {
                    case 'limit':
                    default:
                        return this.price * this.quantity
                    case 'market':
                        return this.markets[this.symbolActive].quote.bid * this.quantity
                    case 'stop':
                        return this.stopPrice * this.quantity
                }
            },
            confirmationText() {
                if (!this.modalOrderConfirmActive) {
                    return ''
                }
                let text = this.tokens['OrderConfirmationText'+this.orderToConfirm.type]

                text = text.split('%symbol%').join(this.markets[this.orderToConfirm.symbol].alias).split('%side%').join(this.tokens[this.orderToConfirm.side ? 'BUY' : 'SELL']).split('%quantity%').join(this.orderToConfirm.quantity)

                if (this.orderToConfirm.type === 'LIMIT') {
                    text = text.split('%price%').join(this.orderToConfirm.price)
                }

                if (this.orderToConfirm.type === 'STOP') {
                    text = text.split('%price%').join(this.orderToConfirm.priceStop)
                }

                return text
            }
        },
        watch: {
            leverageSlider(val) {
                if (!val) {
                    this.leverageInput = 0
                    return;
                }

                if (isNaN(parseFloat(val)) || String(val).charAt(val.length - 1) === '.') {
                    return
                }
                this.leverageInput = parseFloat(val)
                this.leverage = parseFloat(val)
            },
            leverageInput(val) {
                this.leverage = val == 0 ? 'Cross' : val

                this.leverageSlider = val
            }
        }
    }
</script>

<style scoped>
    .form-row {
        display: flex;
        align-items: center;
        flex-direction: row;
    }

    h5 {
        margin-bottom: 15px
    }

    label {
        margin-right: 15px;
        flex: 0 0 70px;
        text-align: right;
    }

    .cur {
        background-color: var(--background);
        height: calc(1.5em + 0.75rem + 2px);
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        border: 1px solid var(--background-dark);
        border-radius: 0.25rem;
    }

    .buttons .btn {
        padding: 1em;
        flex: 1;
        margin: 20px 0;
        transition: box-shadow 0.3s ease-in-out;
    }

    .buttons .btn:hover {
        -webkit-box-shadow: inset 0px 0px 20px 0px rgba(0,0,0,0.5);
        -moz-box-shadow: inset 0px 0px 20px 0px rgba(0,0,0,0.5);
        box-shadow: inset 0px 0px 20px 0px rgba(0,0,0,0.5);
    }

    .buttons .btn-buy {
        background-color: var(--green);
        margin-left: 20px;
    }

    .buttons .btn-sell {
        background-color: var(--red);
    }

    .info {
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
    }

    .grey {
        margin: 0 10px 5px 0;
    }

    .slider {
        width: 100% !important;
        margin: 0 20px
    }

    .buttons {
        display: flex;
        align-items: center;
    }

    .confirmation-text {
        font-size: 1.2em;
        line-height: 1.5;
    }

    .leverage {
        width: 50px;
    }
</style>
