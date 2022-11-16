<template>
    <div class="two-cols">
        <div class="onecol">
            <h4>Make a Deposit</h4>
            <div class="form-row form-actions" style="justify-content: flex-start !important;">
                <button type="button" class="btn btn-primary" v-on:click="makeDeposit">Get Address</button>
            </div>
            <div v-bind:class="{hide: depositBitcoinWallet === ''}" class="form-row">
                <label>Bitcoin Address</label>
                <input type="text" placeholder="Bitcoin Wallet Address" v-bind:value="depositBitcoinWallet" disabled="disabled">
                <span class="text-muted">Please note that generated Bitcoin address is valid only for 1 hour. If you need more time to make a deposit, please request a new deposit when you will be ready to make a transfer.</span>
            </div>
            <div class="form-row"  v-bind:class="{hide: depositBitcoinWallet === ''}">
                <img v-bind:src="depositBitcoinWallet ? 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl='+depositBitcoinWallet : ''" />
            </div>
        </div>
        <div class="onecol extra-text">
            <i class="material-icons large">help_outline</i>
            <span class="text">Deposits are processed automatically after receiving a confirmation from the payment system you choose. In order to receive additional information about deposit process feel free to contact our support team via e-mail <a class="support-email" v-bind:href="'mailto:'+supportEmail">{{supportEmail}}</a>  </span>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import {SUPPORT_EMAIL} from '@/common/config'
    import {DEPOSIT_REQUEST} from "@/store/actions.type";

    export default {
        name: "Deposit",
        data() {
            return {
                supportEmail: SUPPORT_EMAIL,
                psp: 'nax'
            }
        },
        computed: {
            ...mapGetters(['depositBitcoinWallet'])
        },
        methods: {
            makeDeposit() {
                switch (this.psp) {
                    case 'nax':
                        this.$store.dispatch(DEPOSIT_REQUEST, {
                            psp: this.psp,
                            currency: 'BTC'
                        })
                        break
                }
            }
        }
    }
</script>

<style scoped>
    img {
        width: 200px;
        height: 200px;
    }
</style>
