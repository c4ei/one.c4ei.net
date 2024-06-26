<template>
    <el-dialog :title="(!notEditableFlag ? '변경' : '확인') + '설정'" :visible.sync="editGameRoomDialogVisible"
        :width="dialogWidth" center :modal="false" :close-on-click-modal="notEditableFlag"
        :before-close="closeEditGameRoomDialog">
        <el-alert v-if="notEditableFlag" :closable="false" center title="只有房主才能변경설정" :style="{ 'font-size': fontSize }"
            type="info"></el-alert>
        <el-form :model="gameRoomValidateForm" ref="gameRoomValidateForm">
            <el-form-item label="방이름" prop="roomName" :rules="[{ required: true, message: '방이름을 입력해주세요', trigger: 'blur' }]">
                <el-input placeholder="방이름을 입력해주세요" type="text" v-model="gameRoomValidateForm.roomName" autocomplete="off"
                    maxlength="15" show-word-limit :disabled="notEditableFlag"></el-input>
            </el-form-item>
            <el-form-item label="비밀번호" prop="password" :rules="[{ trigger: 'blur', validator: checkPassword }]">
                <el-input placeholder="선택사항, 4~8자리" v-model="gameRoomValidateForm.password" autocomplete="off" maxlength="8"
                    show-word-limit :disabled="notEditableFlag"></el-input>
            </el-form-item>
        </el-form>
        <div>
            <span>사용된 카드 수：{{ gameRoomValidateForm.cardNum }}덱</span>
            <el-slider v-model="gameRoomValidateForm.cardNum" :min="2" :max="10" :step="1" :show-tooltip="false"
                :disabled="notEditableFlag"></el-slider>
        </div>
        <div>
            <span>변신 카드 수：{{ gameRoomValidateForm.metamorphoseNum }}장/대리</span>
            <el-slider v-model="gameRoomValidateForm.metamorphoseNum" :min="0" :max="10" :step="2" :show-tooltip="false"
                :disabled="notEditableFlag"></el-slider>
        </div>
        <div slot="footer">
            <template v-if="!notEditableFlag">
                <el-button @click="closeEditGameRoomDialog" style="margin-right:10%">취소</el-button>
                <el-button type="success" @click="editGameRoom">변경</el-button>
            </template>
            <template v-else>
                <el-button type="primary" @click="closeEditGameRoomDialog">닫기</el-button>
            </template>
        </div>
    </el-dialog>
</template>


<script lang="ts">
import Vue, { PropType } from 'vue'
import { WebSocketGameRoom } from '@/type/room'
import { ExecuteValidator, ExecuteValidate } from '@/type/validator'

const checkPassword: ExecuteValidator = (rule, value, callback) => {
    if (value === '') {
        callback();
    }
    else {
        const uPattern = /^[0-9]{4,8}$/
        if (!uPattern.test(value)) {
            callback(new Error('비밀번호须4到8位数字'));
        }
        else {
            callback();
        }
        callback();
    }
}
export default Vue.extend({
    data() {
        return {
            notEditableFlag: true,
            gameRoomValidateForm: {
                roomName: '',
                password: '',
                cardNum: 2,
                metamorphoseNum: 4,
            },
            checkPassword: checkPassword,
        }
    },

    props: {
        editGameRoomDialogVisible: { type: Boolean, default: false },
        dialogWidth: { type: String, default: '' },
        ws: { type: WebSocket, default: null },
        playerLocRoom: { type: Object as PropType<WebSocketGameRoom>, default: null },
        fontSize: { type: String, default: '' },
    },

    watch: {
        editGameRoomDialogVisible: function (newVal: boolean) {
            if (newVal === true) {
                this.gameRoomValidateForm.roomName = this.playerLocRoom.name
                this.gameRoomValidateForm.password = this.playerLocRoom.needPassword ? this.playerLocRoom.password : ''
                this.gameRoomValidateForm.cardNum = this.playerLocRoom.cardNum
                this.gameRoomValidateForm.metamorphoseNum = this.playerLocRoom.metamorphoseNum
            }
        },

        'playerLocRoom.owner': {
            immediate: true,
            handler: function (newVal) {
                if (this.playerLocRoom === null) {
                    this.notEditableFlag = true
                    return
                }
                if (newVal === this.$stock.state.id) {
                    this.notEditableFlag = false
                }
                else {
                    this.notEditableFlag = true
                }
            },
        },
    },

    methods: {
        editGameRoom: function () {
            const gameRoomValidateFormRef = this.$refs.gameRoomValidateForm as Element & ExecuteValidate
            gameRoomValidateFormRef.validate(valid => {
                if (valid) {
                    if (this.gameRoomValidateForm.roomName === this.playerLocRoom.name && this.gameRoomValidateForm.password === this.playerLocRoom.password && this.gameRoomValidateForm.cardNum === this.playerLocRoom.cardNum && this.gameRoomValidateForm.metamorphoseNum === this.playerLocRoom.metamorphoseNum) {
                        this.closeEditGameRoomDialog()
                        return
                    }
                    this.ws?.send(JSON.stringify({
                        type: 'gameRoomList',
                        action: 'edit',
                        id: this.playerLocRoom.id,
                        name: this.gameRoomValidateForm.roomName,
                        needPassword: this.gameRoomValidateForm.password.length > 0 ? true : false,
                        password: this.gameRoomValidateForm.password,
                        cardNum: this.gameRoomValidateForm.cardNum,
                        metamorphoseNum: this.gameRoomValidateForm.metamorphoseNum,
                    }))
                    setTimeout(() => {
                        this.closeEditGameRoomDialog()
                    }, 100)
                }
            })
        },

        closeEditGameRoomDialog: function () {
            this.$emit('editGameRoomDialogVisible', false)
            const gameRoomValidateFormRef = this.$refs.gameRoomValidateForm as Element & ExecuteValidate
            gameRoomValidateFormRef.clearValidate()
            this.gameRoomValidateForm.roomName = this.playerLocRoom.name
            this.gameRoomValidateForm.password = this.playerLocRoom.needPassword ? this.playerLocRoom.password : ''
            this.gameRoomValidateForm.cardNum = this.playerLocRoom.cardNum
            this.gameRoomValidateForm.metamorphoseNum = this.playerLocRoom.metamorphoseNum
        },
    }
})
</script>