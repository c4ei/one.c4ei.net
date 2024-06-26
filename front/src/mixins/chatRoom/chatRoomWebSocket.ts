import Vue from 'vue'
import { playSound } from '@/utils/soundHandler'
import { GamePlayerSeatIndex } from '@/type/index'
import { PlayerLocRomTypeChatMessageObject, ChatTextInfo, WebSocketGameRoom, WebSocketChangeSeat } from '@/type/room'
import { WebSocketGame, GameResult } from '@/type/game'
import { ElLoadingComponent } from 'element-ui/types/loading'
import { WebSocketPlayer } from '@/type/player'
import { ChatModuleRef } from '@/type/ref'
import { TextToPlayerGameData, WebSocketChangeSeatResponseJsonData, WebSocketChatResponseJsonData, WebSocketExceptionMessageResponseJsonData, WebSocketGameResponseJsonData, WebSocketGameRoomListResponseJsonData, WebSocketMessageResponseJsonData, WebSocketPlayerListResponseJsonData } from '@/type/websocket'

export const chatRoomWebSocket = Vue.extend({
    data: function () {
        return {
            wsUrl: process.env.VUE_APP_WS_URL,
            /* 防止多次重连 */
            lockReconnect: false,
            /* 重连一定次数失败后不再重连 */
            reconnectTimes: 0,
            ws: null as WebSocket | null,
            timeoutId: -1,
            serverTimeoutId: -1,
            reconnectTimeoutId: -1,
            /* 断线重连间隔 */
            wsDelay: process.env.VUE_APP_WS_RECONNECT_PERIOD,
            maxReconnectTImes: process.env.VUE_APP_WS_RECONNECT_MAX_TIMES,
            /* 心跳间隔 */
            timeout: process.env.VUE_APP_WS_HEART_BEAT_PERIOD,
            chatTextId: 0,
            // 以下为ChatRoom.vue中的属性，但因为要通过typescript的编译所以写在这里。
            chatText: [] as ChatTextInfo[],
            playerList: [] as WebSocketPlayer[],
            playerLocRoom: null as WebSocketGameRoom | null,
            gameRoomList: [] as WebSocketGameRoom[],
            gameInfo: null as WebSocketGame | null,
            gameResult: null as GameResult | null,
            askChangeSeatDialogVisible: false,
            leaveRoomDialogVisible: false,
            askChangeSeatInfo: null as WebSocketChangeSeat | null,
            playerLocRomTypeChatMessageObject: null as PlayerLocRomTypeChatMessageObject | null,
            loading: null as ElLoadingComponent | null,
            sentGameTextToPlayerObj: { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, } as { [key in GamePlayerSeatIndex]: TextToPlayerGameData | {} },
            gameResultDialogVisible: false,
        }
    },

    computed: {
        /* 判断是否离开了게임大厅 */
        isLeave: function (): boolean {
            return this.$route.path.indexOf('chatroom') === -1
        },
    },

    methods: {
        createWebSocket: function (url: string) {
            const self = this
            this.ws = new WebSocket(url)
            this.ws.onopen = function () {
                self.start()
                self.ws?.send(JSON.stringify({ type: 'gameRoomList', id: 0 }))
                if (self.$stock.state.player_loc > 0) {
                    self.ws?.send(JSON.stringify({ type: 'playerList', action: 'get' }))
                }
                else {
                    self.ws?.send(JSON.stringify({ type: 'playerList', nickname: self.$stock.state.nickname, avatar_id: self.$stock.state.avatar_id, player_loc: self.$stock.state.player_loc, player_status: self.$stock.state.player_status }))
                }
                self.sendMessageToChatRoom({ 'id': 0, name: '【시스템 메시지】', type: 'success', 'text': '게임 로비에 입장하여 서버에 성공적으로 연결' });
            };

            this.ws.onmessage = function (data) {
                const jsonData: WebSocketChangeSeatResponseJsonData | WebSocketChatResponseJsonData | WebSocketExceptionMessageResponseJsonData | WebSocketGameResponseJsonData | WebSocketGameRoomListResponseJsonData | WebSocketMessageResponseJsonData | WebSocketPlayerListResponseJsonData = JSON.parse(data.data)
                self.reconnectTimes = 0
                if (jsonData.type === 'chat') {
                    const { player_loc } = jsonData
                    if (player_loc === self.$stock.state.player_loc) {
                        const { userId, nickname, text } = jsonData
                        if (userId > 0) { // 如果是플레이어发言则推入聊天框数组
                            self.sendMessageToChatRoom({ 'id': 0, name: userId === self.$stock.state.id ? '나' : nickname, type: 'info', 'text': text })
                        }
                        if (player_loc > 0) {
                            self.playerLocRomTypeChatMessageObject = { id: userId, nickname: nickname, text: text }
                        }
                    }
                }
                else if (jsonData.type === 'system') {//聊天框显示系统信息
                    if (jsonData.player_loc === self.$stock.state.player_loc) {
                        self.sendMessageToChatRoom({ 'id': 0, name: '【시스템 메시지】', type: 'warning', 'text': jsonData.text })
                    }
                }
                else if (jsonData.type === 'message') {//上方弹窗显示系统信息
                    if (jsonData.player_loc === self.$stock.state.player_loc) {
                        self.$message({ message: jsonData.text, type: jsonData.subType })
                    }
                }
                else if (jsonData.type === 'error') {
                    if (jsonData.player_loc === self.$stock.state.player_loc) {
                        self.sendMessageToChatRoom({ 'id': 0, name: '【시스템 메시지】', type: 'error', 'text': jsonData.text })
                        self.$message.error(jsonData.text)
                    }
                }
                else if (jsonData.type === 'askChangeSeat') {
                    self.askChangeSeatDialogVisible = true
                    self.askChangeSeatInfo = jsonData.data
                }
                else if (jsonData.type === 'playerList') {
                    const newPlayerList: WebSocketPlayer[] = []
                    let playerLoc = 0
                    let playerStatus = 0
                    for (let i = 0; i < jsonData.data.length; i++) {
                        const player: WebSocketPlayer = JSON.parse(jsonData.data[i])
                        newPlayerList.push(player)
                        /* 获取플레이어的位置和状态信息 */
                        if (player.id === self.$stock.state.id) {
                            playerLoc = player.player_loc
                            playerStatus = player.player_status
                        }
                    }
                    if (playerLoc !== 0) {
                        /* 此设定暂时摒弃：在大厅则获取所有플레이어信息，不在大厅，但在同一房间，也获取该플레이어信息。*/
                        // newPlayerList = newPlayerList.filter( player => player.player_loc === playerLoc )
                        if (self.$stock.state.player_loc === 0) {
                            self.$message.success('방에 성공적으로 입장했습니다')
                        }
                    }
                    else {
                        if (self.$stock.state.player_loc !== 0) {
                            self.$message.info('방에서 나와 게임 로비로 돌아왔습니다.')
                        }
                    }
                    self.$stock.dispatch('mutatePlayerLoc', playerLoc)
                    self.$stock.dispatch('mutatePlayerStatus', playerStatus)
                    self.playerList = newPlayerList
                }
                else if (jsonData.type === 'gameRoomList') {
                    const newGameRoomList: WebSocketGameRoom[] = []
                    let playerLoc = 0 //gameRoomList中플레이어所在房间id
                    let playerLocRoom: WebSocketGameRoom | null = null //gameRoomList中플레이어所在房间
                    for (let i = 0; i < jsonData.data.length; i++) {
                        const room: WebSocketGameRoom = JSON.parse(jsonData.data[i])
                        newGameRoomList.push(room)
                        /* 获取플레이어自身在哪개房间 */
                        for (let j = 0; j < Object.keys(room.playerList).length; j++) {
                            if (self.$stock.state.id === room.playerList[j as GamePlayerSeatIndex].id) {
                                playerLoc = room.id
                                playerLocRoom = room
                                break
                            }
                        }
                    }
                    /* 플레이어在某개房间 */
                    if (playerLocRoom !== null) {
                        self.playerLocRoom = playerLocRoom
                        /* 如果플레이어现在位置和上面获取到的不一样则通过playerList설정为一样，并相应설정플레이어状态 */
                        if (self.$stock.state.player_loc !== playerLoc) {
                            self.ws?.send(JSON.stringify({ type: 'playerList', nickname: self.$stock.state.nickname, avatar_id: self.$stock.state.avatar_id, player_loc: playerLoc, player_status: playerLoc === 0 ? 0 : (playerLocRoom.status === 0 ? 1 : 2) }))
                        }
                        /* 如果플레이어所在房间正在게임中且本地没有该게임信息 */
                        if (playerLocRoom.status === 1 && self.gameInfo === null) {
                            self.ws?.send(JSON.stringify({ type: 'game', action: 'get', id: playerLocRoom.id }))
                        }
                        /* 如果플레이어所在房间게임已结束且本地还存有게임 */
                        if (playerLocRoom.status === 0 && self.gameInfo !== null) {
                            self.gameInfo = null
                        }
                    }
                    /* 플레이어不在任一房间 */
                    else {
                        self.ws?.send(JSON.stringify({ type: 'playerList', nickname: self.$stock.state.nickname, avatar_id: self.$stock.state.avatar_id, player_loc: 0, player_status: 0 }))
                    }
                    self.gameRoomList = newGameRoomList
                    self.$nextTick(() => {
                        self.loading?.close()
                    })
                }
                else if (jsonData.type === 'game') {
                    if (jsonData.action === 'initialize') {
                        self.gameInfo = JSON.parse(jsonData.data)
                        self.leaveRoomDialogVisible = false
                        self.askChangeSeatDialogVisible = false
                    }
                    else if (jsonData.action === 'shiftOnline') {
                        if (self.gameInfo !== null) {
                            const seatIndex: GamePlayerSeatIndex = jsonData.seatIndex
                            self.gameInfo.gamePlayer[seatIndex].online = jsonData.online
                        }
                    }
                    else if (jsonData.action === 'textToPlayer') {
                        const seatIndex: GamePlayerSeatIndex = jsonData.data.source
                        self.sentGameTextToPlayerObj[seatIndex] = jsonData.data
                    }
                    else if (jsonData.action === 'delete') {
                        self.gameInfo = null
                    }
                    else if (jsonData.action === 'result') {
                        self.gameResult = JSON.parse(jsonData.data)
                        self.gameResultDialogVisible = true
                        playSound('game-over-voice')
                        playSound('game-over')
                        if (self.gameResult !== null) {
                            for (let i = 0; i < self.gameResult.playerExpList.length; i++) {
                                if (self.gameResult.playerExpList[i].id === self.$stock.state.id) {
                                    self.$message.success('얻다 ' + self.gameResult.playerExpList[i].exp + ' 경험 포인트')
                                    break
                                }
                            }
                        }
                    }
                    else { // 此处 action = 'get'或'update', 'update'时对应请求动作 'play' 或 'discard'
                        const gameData: WebSocketGame = JSON.parse(jsonData.data)
                        /* 获取到的게임数据版本高于本地的才接받다 */
                        if (gameData.version > (self.gameInfo?.version || 0)) {
                            self.gameInfo = gameData
                        }
                    }
                }
                self.reset()
            };

            this.ws.onclose = function (close) {
                if (close.code === 1000) {
                    clearInterval(self.timeoutId);
                    clearTimeout(self.serverTimeoutId);
                    clearTimeout(self.reconnectTimeoutId);
                    self.sendMessageToChatRoom({ 'id': 0, name: '【시스템 메시지】', type: 'error', text: close.reason });
                }
                else {
                    if (self.isLeave === false) {
                        self.reconnect()
                        self.loading = self.$loading({
                            lock: true,
                            text: '연결 시도 중',
                            spinner: 'el-icon-loading',
                            background: 'rgba(255, 255, 255, 0.7)'
                        })
                    }
                }
            };

            this.ws.onerror = function () {
                if (self.isLeave === false) {
                    self.loading = self.$loading({
                        lock: true,
                        text: '네트워크 이상, 다시 연결해 보세요',
                        spinner: 'el-icon-loading',
                        background: 'rgba(255, 255, 255, 0.7)'
                    })
                    self.reconnect()
                }
            };
        },

        reset: function () {
            clearTimeout(this.serverTimeoutId);
            clearTimeout(this.reconnectTimeoutId);
        },

        start: function () {
            const self = this
            this.timeoutId = setInterval(function () {
                self.ws?.send(JSON.stringify({ type: 'ping' }));
                self.serverTimeoutId = setTimeout(function () {
                    self.ws?.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                }, self.timeout)
            }, this.timeout)
        },

        reconnect: function () {
            const self = this
            if (this.lockReconnect) return;
            this.lockReconnect = true;
            this.reconnectTimeoutId = setTimeout(function () {     //没连接上会一直重连，설정延迟避免请求过多 => 연결되지 않은 경우 계속해서 다시 연결되므로 요청이 너무 많아지지 않도록 지연 시간을 설정하세요.
                if (self.isLeave === false) {
                    if (self.reconnectTimes < self.maxReconnectTImes) {//离开页面后则不再刷新心跳
                        self.reconnectTimes = self.reconnectTimes + 1
                        self.sendMessageToChatRoom({ 'id': 0, name: '【시스템 메시지】', type: 'warning', text: '서버 연결이 끊어졌습니다. 다시 연결을 시도 중입니다...' });
                        self.createWebSocket(self.wsUrl);
                        self.lockReconnect = false;
                    }
                    else {
                        self.$message.error('게임 로비에서 연결이 끊겼습니다.');
                        self.sendMessageToChatRoom({ 'id': 0, name: '【시스템 메시지】', type: 'error', text: '게임 로비에서 연결이 끊겼습니다.' });
                        self.loading?.close()
                        clearInterval(self.timeoutId);
                        clearTimeout(self.serverTimeoutId);
                        clearTimeout(self.reconnectTimeoutId);
                    }
                }
                else {
                    clearInterval(self.timeoutId);
                    clearTimeout(self.serverTimeoutId);
                    clearTimeout(self.reconnectTimeoutId);
                }
            }, self.wsDelay);
        },


        sendMessageToChatRoom: function (message: ChatTextInfo) {
            if (this.gameInfo !== null) return
            if (this.isLeave === false) {
                this.chatTextId = this.chatTextId + 1
                message.id = this.chatTextId
                this.chatText.push(message);
                if (this.chatText.length > 50) this.chatText.shift();
                this.$nextTick(function () {
                    /* 참조 레이어를 통해 하위 구성 요소의 채팅 상자에 액세스하고 스크롤 막대 높이를 조정합니다. */
                    if (!this.$refs.chatModule) return
                    const chatModuleRef = this.$refs.chatModule as Element & ChatModuleRef
                    chatModuleRef.modifyScrollHeight()
                })
            }
        },
    },

    created: function () {
        this.createWebSocket(this.wsUrl)
    },

    beforeDestroy: function () {
        clearInterval(this.timeoutId);
        clearTimeout(this.serverTimeoutId);
        clearTimeout(this.reconnectTimeoutId);
        this.$nextTick(() => {
            this.ws?.close()
        })
    }
})

