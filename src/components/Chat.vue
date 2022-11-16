<template>
    <div class="chat">
        <div class="form-row" :class="{hide: collapsed}">
            <textarea v-model="message" @keyup.enter="sendMessage"/>
            <button class="btn btn-primary"><i class="material-icons" v-on:click="sendMessage">send</i> Send</button>
        </div>
        <div class="scroll-container" id="chat-messages" :class="{hide: collapsed}">
            <div v-for="message in chatMessages"
                 :key="message.id"
                 :class="message.user_id !== user.id ? 'from-manager' : 'from-client'"
                 class="message"
            >
                <div class="box">
                    <span class="text">{{ message.text }}</span>
                    <span class="time">{{ message.user_fullname }} - {{ timeToString(message.time_created*1000).split(' ')[1]+' '+timeToString(message.time_created*1000).split(' ')[0].slice(0,5) }}</span>
                </div>
            </div>
        </div>
        <div class="chat-header" v-on:click="collapsed = !collapsed" :class="{collapsed: collapsed}">
            <span>Traders Chat</span>
            <i class="material-icons">{{ collapsed ? 'expand_less' : 'expand_more' }}</i>
        </div>
    </div>
</template>

<script>
import {CHAT_MESSAGE_SEND} from "@/store/actions.type";
import {mapGetters} from "vuex";
import {timeToString} from "@/common/helpers";

export default {
    name: "chat",
    data() {
        return {
            message: '',
            collapsed: true
        }
    },
    methods : {
        sendMessage() {
            if (!this.message) {
                return
            }
            this.$store.dispatch(CHAT_MESSAGE_SEND, this.message)
            this.message = ''
        },
        timeToString
    },
    computed: {
        ...mapGetters(['tokens', 'modalChatActive', 'chatMessages', 'user'])
    },
    watch: {
        chatMessages() {
            setTimeout(() => {
                let container = document.getElementById("chat-messages")
                container.scrollTop = container.scrollHeight
            }, 300)
        },
        collapsed() {
            setTimeout(() => {
                let container = document.getElementById("chat-messages")
                container.scrollTop = container.scrollHeight
            }, 300)
        }
    }
}
</script>

<style scoped>
    .chat {
        position: fixed;
        bottom: 0;
        right: 30px;
        background: var(--background);
        max-height: 50%;
        display: flex;
        flex-direction: column-reverse;
        border: 1px solid var(--border);
        border-radius: 10px 10px 0 0;
        overflow: hidden;
        width: 20%;
        min-width: 250px;
    }

    .chat-header {
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 10px;
        justify-content: space-between;
        font-size: 1.3em;
        border-bottom: 1px solid var(--font);
    }

    .chat-header.collapsed {
        border-bottom: none
    }

    .scroll-container {
        overflow-y: scroll;
        flex: 1 1 auto;
        padding: 0 20px;
    }

    .form-row {
        margin-top: 15px;
        flex: 0 0 50px;
        display: flex;
        align-items: stretch;
        flex-direction: row !important;
    }

    textarea {
        flex: 1 1 auto;
        height: auto;
    }

    .btn {
        margin-left: 20px;
        flex: 0 0 50px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    .message {
        display: flex;
        width: 100%;
    }

    .from-client {
        justify-content: flex-end;
    }

    .from-manager {
        justify-content: flex-start;
    }

    .box {
        max-width: 90%;
        display: flex;
        flex-direction: column;
        margin: 2px;
        background-color: var(--background);
        border-radius: 3px;
        min-width: 140px;
    }

    .text {
        padding: 10px 0 0 10px;
    }

    .from-client {
        text-align: right;
    }

    .from-manager {
        text-align: left;
    }

    .time {
        display: flex;
        justify-content: flex-end;
        font-size: 0.7em;
        padding: 3px;
        color: var(--secondary-button);
    }
</style>
