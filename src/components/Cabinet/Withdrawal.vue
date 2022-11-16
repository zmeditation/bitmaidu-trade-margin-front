<template>
    <div class="two-cols">
        <div class="onecol">
            <h4>Request a Withdrawal</h4>
            <div class="form-row">
                <label>Amount</label>
                <input type="text" placeholder="Enter amount" v-model="amount">
                <span class="text-muted">Your current balance is {{account.balance.toFixed(2)}}. <span class="subaction" v-on:click="amount = account.balance.toFixed(2)">Withdraw all</span></span>
            </div>
            <div class="form-row">
                <label>Method</label>
                <select v-model="method">
                    <option value="btc">Bitcoin Transfer</option>
                    <option value="bank">Bank Transfer</option>
                </select>
            </div>
            <div class="form-row" v-bind:class="{hide: method !== 'btc'}">
                <label>Bitcoin Address</label>
                <input type="text" placeholder="Bitcoin Wallet Address" v-model="methods.btc.wallet">
            </div>
            <div class="form-row" v-bind:class="{hide: method !== 'bank'}">
                <label>Account Number</label>
                <input type="text" placeholder="Your account number" v-model="methods.bank.account">

            </div>
            <div class="form-row" v-bind:class="{hide: method !== 'bank'}">
                <label>Account Holder</label>
                <input type="text" placeholder="Account holder full name" v-model="methods.bank.holder">

            </div>
            <div class="form-row" v-bind:class="{hide: method !== 'bank'}">
                <label>IBAN</label>
                <input type="text" placeholder="IBAN" v-model="methods.bank.iban">

            </div>
            <div class="form-row" v-bind:class="{hide: method !== 'bank'}">
                <label>SWIFT/BIC</label>
                <input type="text" placeholder="Bank SWIFT/BIC code" v-model="methods.bank.swift">

            </div>
            <div class="form-row form-actions">
                <button type="button" class="btn btn-primary" v-on:click="requestWithdrawal">Request Withdrawal</button>
            </div>
        </div>
        <div class="onecol extra-text">
            <i class="material-icons large">help_outline</i>
            <span class="text">All withdrawals are processed manually during the working hours of our support desk. Please don't send the repeating requests as it will not speed up the process. In order to receive additional information about withdrawal process feel free to contact our support team via e-mail <a class="support-email" v-bind:href="'mailto:'+supportEmail">{{supportEmail}}</a> </span>
        </div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {SUPPORT_EMAIL} from '@/common/config'
import {WITHDRAWAL_REQUEST} from "@/store/actions.type"

export default {
    name: "Withdrawal",
    data() {
        return {
            supportEmail: SUPPORT_EMAIL,
            amount: '',
            method: 'btc',
            methods: {
                btc: {
                    wallet: ''
                },
                bank: {
                    account: '',
                    holder: '',
                    iban: '',
                    swift: ''
                }
            }
        }
    },
    methods: {
        requestWithdrawal() {
            let details = ''
            switch (this.method) {
                case 'btc':
                    details = this.methods.btc.wallet
                    break
            }

            this.$store.dispatch(WITHDRAWAL_REQUEST, {
                wallet: details,
                amount: this.amount
            })

            this.method = 'btc'
            this.methods.btc.wallet = ''
            this.methods.bank.account = ''
            this.methods.bank.holder = ''
            this.methods.bank.iban = ''
            this.methods.bank.swift = ''
        }
    },
    computed: {
        ...mapGetters(['account'])
    }
}
</script>

<style scoped>

</style>
