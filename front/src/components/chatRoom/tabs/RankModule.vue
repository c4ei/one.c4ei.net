<template>
    <el-collapse v-model="activeName" @change="changeHandler" accordion>

        <el-collapse-item name="level">
            <template slot="title">
                <i class="el-icon-medal-1"></i>레벨
            </template>
            <template v-if="rankInfo !== null">
                <p>{{ showTopThreeLabel }}</p>
                <RankItem v-for="item in rankInfo.rankList" :key="item.id" :rank="item.rank" :avatarId="item.avatarId"
                    :nickname="item.nickname" :record="calLevel(item.record) + '레벨'" :fontSize="fontSize"></RankItem>
                <p>{{ showPlayerName }}</p>
                <RankItem v-if="rankInfo.playerInfo !== null" :rank="rankInfo.playerInfo.rank"
                    :avatarId="playerProfile.avatar_id" :nickname="playerProfile.nickname"
                    :record="calLevel(rankInfo.playerInfo.record) + '레벨'" :fontSize="fontSize"></RankItem>
            </template>
        </el-collapse-item>

        <el-collapse-item name="winner">
            <template slot="title">
                <i class="el-icon-chicken"></i>우승
            </template>
            <template v-if="rankInfo !== null">
                <p>{{ showTopThreeLabel }}</p>
                <RankItem v-for="item in rankInfo.rankList" :key="item.id" :rank="item.rank" :avatarId="item.avatarId"
                    :nickname="item.nickname" :record="item.record + '국'" :fontSize="fontSize"></RankItem>
                <p>{{ showPlayerName }}</p>
                <RankItem v-if="rankInfo.playerInfo !== null" :rank="rankInfo.playerInfo.rank"
                    :avatarId="playerProfile.avatar_id" :nickname="playerProfile.nickname"
                    :record="rankInfo.playerInfo.record + '국'" :fontSize="fontSize"></RankItem>
            </template>
        </el-collapse-item>

        <el-collapse-item name="loser">
            <template slot="title">
                <i class="el-icon-delete"></i>당기기
            </template>
            <template v-if="rankInfo !== null">
                <p>{{ showTopThreeLabel }}</p>
                <RankItem v-for="item in rankInfo.rankList" :key="item.id" :rank="item.rank" :avatarId="item.avatarId"
                    :nickname="item.nickname" :record="item.record + '국'" :fontSize="fontSize"></RankItem>
                <p>{{ showPlayerName }}</p>
                <RankItem v-if="rankInfo.playerInfo !== null" :rank="rankInfo.playerInfo.rank"
                    :avatarId="playerProfile.avatar_id" :nickname="playerProfile.nickname"
                    :record="rankInfo.playerInfo.record + '국'" :fontSize="fontSize"></RankItem>
            </template>
        </el-collapse-item>

        <el-collapse-item name="sum">
            <template slot="title">
                <i class="el-icon-files"></i>총 수집된 카드 수
            </template>
            <template v-if="rankInfo !== null">
                <p>{{ showTopThreeLabel }}</p>
                <RankItem v-for="item in rankInfo.rankList" :key="item.id" :rank="item.rank" :avatarId="item.avatarId"
                    :nickname="item.nickname" :record="item.record + '장'" :fontSize="fontSize"></RankItem>
                <p>{{ showPlayerName }}</p>
                <RankItem v-if="rankInfo.playerInfo !== null" :rank="rankInfo.playerInfo.rank"
                    :avatarId="playerProfile.avatar_id" :nickname="playerProfile.nickname"
                    :record="rankInfo.playerInfo.record + '장'" :fontSize="fontSize"></RankItem>
            </template>
        </el-collapse-item>

        <el-collapse-item name="combo">
            <template slot="title">
                <i class="el-icon-tickets"></i>최대 콤보 카드 수
            </template>
            <template v-if="rankInfo !== null">
                <p>{{ showTopThreeLabel }}</p>
                <RankItem v-for="item in rankInfo.rankList" :key="item.id" :rank="item.rank" :avatarId="item.avatarId"
                    :nickname="item.nickname" :record="item.record + '장'" :fontSize="fontSize"></RankItem>
                <p>{{ showPlayerName }}</p>
                <RankItem v-if="rankInfo.playerInfo !== null" :rank="rankInfo.playerInfo.rank"
                    :avatarId="playerProfile.avatar_id" :nickname="playerProfile.nickname"
                    :record="rankInfo.playerInfo.record + '장'" :fontSize="fontSize"></RankItem>
            </template>
        </el-collapse-item>

        <el-collapse-item name="least_cards">
            <template slot="title">
                <i class="el-icon-medal"></i>최소 수집된 카드 수
            </template>
            <template v-if="rankInfo !== null">
                <p>{{ showTopThreeLabel }}</p>
                <RankItem v-for="item in rankInfo.rankList" :key="item.id" :rank="item.rank" :avatarId="item.avatarId"
                    :nickname="item.nickname" :record="item.record + '장'" :fontSize="fontSize"></RankItem>
                <p>{{ showPlayerName }}</p>
                <RankItem v-if="rankInfo.playerInfo !== null" :rank="rankInfo.playerInfo.rank"
                    :avatarId="playerProfile.avatar_id" :nickname="playerProfile.nickname"
                    :record="rankInfo.playerInfo.record + '장'" :fontSize="fontSize"></RankItem>
            </template>
        </el-collapse-item>

        <el-collapse-item name="lowest_rate">
            <template slot="title">
                <i class="el-icon-trophy"></i>최소 마감 비율
            </template>
            <template v-if="rankInfo !== null">
                <p>{{ showTopThreeLabel }}</p>
                <RankItem v-for="item in rankInfo.rankList" :key="item.id" :rank="item.rank" :avatarId="item.avatarId"
                    :nickname="item.nickname" :record="(item.record / 10) + '%'" :fontSize="fontSize"></RankItem>
                <p>{{ showPlayerName }}</p>
                <RankItem v-if="rankInfo.playerInfo !== null" :rank="rankInfo.playerInfo.rank"
                    :avatarId="playerProfile.avatar_id" :nickname="playerProfile.nickname"
                    :record="(rankInfo.playerInfo.record / 10) + '%'" :fontSize="fontSize"></RankItem>
            </template>
        </el-collapse-item>

        <el-collapse-item name="most_cards">
            <template slot="title">
                <i class="el-icon-s-data"></i>최다 주문 수집된 카드 수
            </template>
            <template v-if="rankInfo !== null">
                <p>{{ showTopThreeLabel }}</p>
                <RankItem v-for="item in rankInfo.rankList" :key="item.id" :rank="item.rank" :avatarId="item.avatarId"
                    :nickname="item.nickname" :record="item.record + '장'" :fontSize="fontSize"></RankItem>
                <p>{{ showPlayerName }}</p>
                <RankItem v-if="rankInfo.playerInfo !== null" :rank="rankInfo.playerInfo.rank"
                    :avatarId="playerProfile.avatar_id" :nickname="playerProfile.nickname"
                    :record="rankInfo.playerInfo.record + '장'" :fontSize="fontSize"></RankItem>
            </template>
        </el-collapse-item>

        <el-collapse-item name="highest_rate">
            <template slot="title">
                <i class="el-icon-trophy-1"></i>최고단일카드 마감비율
            </template>
            <template v-if="rankInfo !== null">
                <p>{{ showTopThreeLabel }}</p>
                <RankItem v-for="item in rankInfo.rankList" :key="item.id" :rank="item.rank" :avatarId="item.avatarId"
                    :nickname="item.nickname" :record="(item.record / 10) + '%'" :fontSize="fontSize"></RankItem>
                <p>{{ showPlayerName }}</p>
                <RankItem v-if="rankInfo.playerInfo !== null" :rank="rankInfo.playerInfo.rank"
                    :avatarId="playerProfile.avatar_id" :nickname="playerProfile.nickname"
                    :record="(rankInfo.playerInfo.record / 10) + '%'" :fontSize="fontSize"></RankItem>
            </template>
        </el-collapse-item>

    </el-collapse>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { PlayerProfile } from '@/type/record'
import { RankInfo, RankType } from '@/type/rank'
import { getRankInfo } from '@/api/getRank'
import RankItem from '@/components/chatRoom/fragments/RankItem.vue'
import { calExperience } from '@/utils/calculator'

export default Vue.extend({
    data() {
        return {
            activeName: '' as RankType | '',
            rankInfo: null as RankInfo | null,
        }
    },

    props: {
        fontSize: { type: String, default: '' },
        playerProfile: { type: Object as PropType<PlayerProfile>, default: null },
        isShowing: { type: Boolean, default: false },
    },

    computed: {
        showPlayerName: function () {
            if (this.playerProfile === null) return ''
            if (this.rankInfo === null || this.rankInfo.playerInfo === null) {
                if (this.playerProfile.id === this.$stock.state.id) {
                    return '你尚未拥有排名'
                }
                return '플레이어尚未拥有排名'
            }
            if (this.playerProfile.id === this.$stock.state.id) {
                return '你的排名'
            }
            return '플레이어排名'
        },

        showTopThreeLabel: function () {
            if (this.playerProfile === null) return ''
            if (this.rankInfo === null || this.rankInfo.rankList.length < 1) return '目前无排名数据'
            return '前三名'
        }
    },

    watch: {
        isShowing: function (newVal: boolean) {
            if (!newVal) {
                this.activeName = ''
            }
        }
    },

    methods: {
        changeHandler: function (activeName: RankType) {
            if (activeName.length === 0) return
            getRankInfo({ type: activeName, id: this.playerProfile.id })
                .then((res) => {
                    this.rankInfo = res.rank
                })
                .catch(() => {
                })
        },

        calLevel: function (exp: number) {
            const result = calExperience(exp)
            return result.level
        }
    },

    components: {
        RankItem,
    },
})
</script>

