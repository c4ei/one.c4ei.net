import Vue from 'vue'
import Vuex, { Store }  from 'vuex'
import { SystemSetting } from '@/type/setting'
import { Account } from '@/type/player'
import { PlayerStatus } from '@/type/index'
import { State } from '@/type/plugin'

Vue.use(Vuex)
let isMobile = false
if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
    isMobile = true
}


const localSettingStr = localStorage.getItem('setting')
let localSetting: SystemSetting
let needSetLocal = false
if (localSettingStr === null) {
    localSetting = {
		playSound: true,
		playBgm: false,
		bgmVolume: 100,
		soundVolume: 100,
		youTurnVoice: false,
		bianshenBorder: true,
		textToPlayer:
			[
				{ id: 10, music: "10", text: "받다" },
				{ id: 5, music: "5", text: "조금조금조금" },
				{ id: 7, music: "7", text: "스승을 구하라" },
				{ id: 8, music: "8", text: "레이맨을 구하라" },
				{ id: 9, music: "9", text: "차례를 묻는다" },
				{ id: 1, music: "1", text: "당신은 카드를 너무 잘 썼어요" },
				{ id: 2, music: "2", text: "꽃이 시들 때까지 기다렸어요" },
				{ id: 3, music: "3", text: "행복한 협력" },
			],
		announceId: 0,
    }
    needSetLocal = true
}
else {
	localSetting = JSON.parse(localSettingStr)
	//同步本地설정，如果有缺省项目的话则补充설정
	if (localSetting.announceId === undefined) {
		localSetting.announceId = 0
		needSetLocal = true
	}
	if (localSetting.bianshenBorder === undefined) {
		localSetting.bianshenBorder = true
		needSetLocal = true
	}
}
if (needSetLocal) {
  	localStorage.setItem('setting', JSON.stringify(localSetting))
}

export default new Vuex.Store({
	state: {
		id: 0,
		username: '',
		avatar_id: 0,
		nickname: '',
		isMobile: isMobile,
		player_loc: 0,  //0为게임大厅，其余为게임房间号
		player_status: 0, //0게으른1기다리다2바쁘다
		setting: localSetting,
	},
	mutations: {
		initialization(state, payload: Account) {
			state.id = payload.id
			state.username = payload.username
			state.avatar_id = payload.avatar_id
			state.nickname = payload.nickname
		},
		mutateNickname(state, payload: string) {
			state.nickname = payload
		},
		mutateAvatarId(state, payload: number) {
			state.avatar_id = payload
		},
		mutatePlayerLoc(state, payload: number) {
			state.player_loc = payload
		},
		mutatePlayerStatus(state, payload: PlayerStatus) {
			state.player_status = payload
		},
		mutateSetting(state, payload: SystemSetting) {
			state.setting = payload
		},
	},
	actions: {
		initialization({ commit }, payload: Account) {
			commit('initialization', payload)
		},
		mutateNickname({ commit }, payload: string) {
			commit('mutateNickname', payload)
		},
		mutateAvatarId({ commit }, payload: number) {
			commit('mutateAvatarId', payload)
		},
		mutatePlayerLoc({ commit }, payload: number) {
			commit('mutatePlayerLoc', payload)
		},
		mutatePlayerStatus({ commit }, payload: PlayerStatus) {
			commit('mutatePlayerStatus', payload)
		},
		mutateSetting({ commit }, payload: SystemSetting) {
			commit('mutateSetting', payload)
			localStorage.setItem('setting', JSON.stringify(payload))
		},
	},
	modules: {
	}
})

/** 
 * @see https://github.com/vuejs/vuex/issues/994#issuecomment-604897329
 * 因为直接通过this.$store获取不到类型提示，所以使用这개workaround：以$stock代替$store
 *  */
Object.defineProperty(Vue.prototype, "$stock", {
	get(): Store<State> {
		return this.$store
	}
})
