<template>
    <div class="flex-row">
        <div class="header flex-col">
            <div class="info">
                <img class="logo" src="@/assets/logo.svg" />
                <!-- <span class="logo-text">{{ companyName }}</span> -->
                <div class="buttons-mobile">
                <span class="btn btn-primary info-item"
                      v-on:click="showCabinet"
                      v-bind:class="{hide: !loggedIn}"
                >{{ tokens.Account }}</span>
                    <span class="btn btn-primary info-item"
                          v-on:click="logout"
                          v-bind:class="{hide: !loggedIn}"
                    >{{ tokens.SignOut }}</span>
                    <span class="info-item language">
                    <span class="flag-icon" :class="'flag-icon-'+langActive"></span>
                    <ul>
                        <li v-on:click="changeLang('gb')"><span class="flag-icon flag-icon-gb"></span> English</li>
                        <li v-on:click="changeLang('ru')"><span class="flag-icon flag-icon-ru"></span> Русский</li>
                        <li v-on:click="changeLang('jp')"><span class="flag-icon flag-icon-jp"></span> Japanese</li>
                    </ul>
                </span>
                </div>
            </div>
            <div class="info2">
            <span class="info-item">
                <i class="material-icons">published_with_changes</i>
                <span>{{ tokens.Funding }}: {{ (tradeConfig.funding_rate * 100).toFixed(2) }}% {{ tokens.in }} {{ timer }}</span>
            </span>
            <span class="info-item" v-bind:class="{hide: !loggedIn}">
                <i class="material-icons">account_circle</i>
                <span>{{user.fullname}}</span>
            </span>
            <span class="info-item" v-bind:class="{hide: !loggedIn}">
                <i class="material-icons">monetization_on</i>
                <span>{{ tokens.Equity }}: <span class="grey">{{ account.currency }}</span><span>{{ margin.equity.toFixed(account.precision) }}</span></span>
            </span>
            <span class="info-item" v-bind:class="{hide: !loggedIn}">
                <i class="material-icons">lock</i>
                <span>{{ tokens.Margin }}: <span class="grey">{{ account.currency }}</span><span>{{ margin.margin.toFixed(account.precision) }}</span></span>
            </span>
            <span class="info-item" v-bind:class="{hide: !loggedIn}">
                <i class="material-icons">swap_vertical_circle</i>
                <span>{{ tokens.MarginLevel }}: {{ margin.marginLevel.toFixed(2) }}%</span>
            </span>
            <div class="buttons">
                <span class="btn btn-primary info-item"
                      v-on:click="showLogin"
                      v-bind:class="{hide: loggedIn}"
                >{{ tokens.SignIn }}</span>
                <span class="btn btn-primary info-item"
                      v-on:click="showCabinet"
                      v-bind:class="{hide: !loggedIn}"
                >{{ tokens.Account }}</span>
                <span class="btn btn-primary info-item"
                      v-on:click="logout"
                      v-bind:class="{hide: !loggedIn}"
                >{{ tokens.SignOut }}</span>
                <span class="info-item language">
                    <span class="flag-icon" :class="'flag-icon-'+langActive"></span>
                    <ul>
                        <li v-on:click="changeLang('gb')"><span class="flag-icon flag-icon-gb"></span> English</li>
                        <li v-on:click="changeLang('ru')"><span class="flag-icon flag-icon-ru"></span> Русский</li>
                        <li v-on:click="changeLang('jp')"><span class="flag-icon flag-icon-jp"></span> Japanese</li>
                    </ul>
                </span>
            </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import {LANG, MODAL_CABINET, MODAL_LOGIN} from "@/store/mutations.type";
    import {LOGOUT} from "@/store/actions.type";
    import {COMPANY_NAME, SEPARATE_CABINET, SEPARATE_LOGIN} from "@/common/config";

    export default {
        name: "Header",
        data() {
            return {
                timer: '',
                interval: null,
                companyName: COMPANY_NAME
            }
        },
        methods: {
            showLogin() {
                if (SEPARATE_LOGIN) {
                    window.location = SEPARATE_LOGIN
                } else {
                    this.$store.commit(MODAL_LOGIN, true)
                }
            },
            showCabinet() {
                if (SEPARATE_CABINET) {
                    window.location = '/cabinet'
                } else {
                    this.$store.commit(MODAL_CABINET, true)
                }
            },
            logout() {
                this.$store.dispatch(LOGOUT)
            },
            changeLang(lang) {
                this.$store.commit(LANG, lang)
            }
        },
        computed: {
            ...mapGetters(['tokens', 'loggedIn', 'user', 'account', 'orders', 'margin', 'tradeConfig', 'langActive'])
        },
        watch: {
            tradeConfig(val) {
                if (this.interval) {
                    clearInterval(this.interval)
                }

                this.interval = setInterval(() => {
                    let n = Date.now(),
                        p = val.funding_period * 1000,
                        d = new Date(p * Math.ceil(n / p) - n)

                    this.timer = ('0'+d.getUTCHours()).slice(-2)+':'+('0'+d.getUTCMinutes()).slice(-2)+':'+('0'+d.getUTCSeconds()).slice(-2)
                }, 1000)
            }
        }
    }
</script>

<style scoped>
    .header {
        display: flex;
        justify-content: space-between;
        padding: 5px 15px 0;
        flex: 1 1 auto;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .logo {
        width: 10em;
        padding-top: 0;
    }
    @media (max-width: 767px) {
        .logo {
            width: 7em;
        }
    }

    .logo-text {
        font-size: 1.3em;
        flex: 1 1 auto;
        display: flex;
        justify-content: flex-start;
        margin-bottom: 10px;
        margin-left: 15px;
    }

    i {
        font-size: 1.4em;
        margin-right: 5px;
    }

    .info {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: space-between;
        padding-bottom: 8px;
        padding-top: 8px;
    }
    .info2 {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    @media (max-width: 767px) {
        .info2 {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            justify-content: space-between;
        }
    }

    .info:first-child {
        flex: 1 1 auto;
    }

    .info-item {
        margin-left: 15px;
        display: flex;
        align-items: center;
    }
    @media (max-width: 767px) {
        .info-item {
            margin-left: 10px;
            display: flex;
            align-items: center;
            font-size: 10px;
        }
    }

    .grey {
        margin-right: 3px;
    }

    .language {
        position: relative;
    }

    .language ul {
        position: absolute;
        z-index: 3;
        top: 10px;
        right: -20px;
        display: none;
        list-style-type: none;
        padding: 10px;
    }

    .language li {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        background: var(--background);
        transition: background-color 0.3s ease-in-out;
    }

    .language li:hover {
        cursor: pointer;
        background: var(--background-dark);
    }

    .language:hover ul {
        display: block;
    }

    .language ul:hover {
        display: block;
    }

    .flag-icon {
        margin-right: 10px;
    }

    @media (max-width: 767px) {
        .buttons {
            display: none !important;
        }

        .buttons-mobile {
            display: flex !important;
        }
    }

    .buttons {
        display: flex;
    }

    .buttons-mobile {
        display: none;
    }
</style>
