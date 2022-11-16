import Vue from 'vue'
import {CHAT_MESSAGE_SEND} from "@/store/actions.type";
import RestService from "@/common/rest.service";
import {LOGOUT, CHAT_MESSAGE, USER} from "@/store/mutations.type";

const state = {
    chatMessages: []
}

const getters = {
    chatMessages() {
        return state.chatMessages
    }
}

const actions = {
    [CHAT_MESSAGE_SEND](context, text) {
        RestService.post('/trollbox/messages', {text})
    }
}

const mutations = {
    [USER]() {
        RestService.get('/trollbox/messages')
            .then(messages => {
                for(let n=messages.length-1; n>=0; n--) {
                    this.commit(CHAT_MESSAGE, messages[n])
                }
            })
    },

    [CHAT_MESSAGE](context, message) {
        state.chatMessages.push(message)
    },

    [LOGOUT]() {
        Vue.set(state, 'chatMessages', [])
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}