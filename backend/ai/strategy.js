const poker = require('../common/poker')
const { getRandom } = poker

/** 
 * @todo 策略待优化
 * @summary PLAY策略处理，选出最佳的PLAY组合。
 * @description 
 * 牌池中无牌时，按요괴，徒弟，师傅&리바운드的주문选出PLAY的组合。即有可打出的요괴牌组合时优先打요괴牌中的随机组合，没有则打徒弟，依次类推。且，
 *   1.当考虑요괴牌的PLAY策略时，플레이어手中的요괴牌越多，越倾向于出多牌组合。
 *   2.当考虑非요괴牌的PLAY策略时，不打반송 카드或带변환牌的多牌,及尽量少打多牌。
 * 牌池中为单牌，콤보 수低，且满足以下条件之一时，弃牌PASS。
 *   1.플레이어手中不能打出的요괴牌多
 *   2.플레이어只能打出徒弟牌管上现在牌池牌面，且플레이어手中요괴牌多
 * 其余情况则按所有PLAY组合中牌面最小，牌序数和最小的组合打出。
 * @param {RedisCacheGame} game
 * @param {number[][]} playCards 各种能出的牌的组合。
 * @param {number[]} remainCards 플레이어现在手中的牌。
 * @returns {number[]} 经过策略推算后打出的牌组合。
 */
function strategy(game, playCards, remainCards) {
    if (playCards.length === 0) return []

    const currentCard = game.currentCard
    if (currentCard.length === 0) {
        const excludeNums = [20, 30, 100]
        let i = 0
        while (i < excludeNums.length) { // 요괴，徒弟，师傅&리바운드，的주문检查是否有可打出的牌组合
            const excludedPlayCards = playCards.filter(playCard => poker.getIndexOfCardList(playCard[0]).num <= excludeNums[i])
            if (excludedPlayCards.length > 0) {
                if (excludeNums[i] <= 20) { // 요괴牌时，요괴牌越多则打多牌机率越大
                    const cardStatus = getCardStatus(remainCards)
                    if (Math.floor(Math.random() * cardStatus.yaoguaiNum) >= 1) {
                        /** @type {number[][]} */
                        let multiplePlayCards = []
                        for (let j = 1; j < cardStatus.yaoguaiNum; j++) {
                            multiplePlayCards = multiplePlayCards.concat(excludedPlayCards.filter(playCard => playCard.length > j)) // 选取多牌的组合，장数越多的组合所占比重越大
                        }
                        if (multiplePlayCards.length > 0) {
                            const excludedNotYaoguaiPlayCards = multiplePlayCards.filter(playCard => playCard.every(card => card < 136)) // 剔除掉用非요괴牌변환来组成多牌的组合
                            if (excludedNotYaoguaiPlayCards.length > 0) {
                                return excludedNotYaoguaiPlayCards[Math.floor(Math.random() * excludedNotYaoguaiPlayCards.length)]
                            }
                            return multiplePlayCards[Math.floor(Math.random() * multiplePlayCards.length)]
                        }
                    }
                }
                else { // 徒弟或师傅牌时，则不打반송 카드或带변환牌的多牌,及尽量少打多牌
                    const morphoseAndJokerExcludedPlayCards = excludedPlayCards.filter(playCard => playCard.length === 1 ? poker.getIndexOfCardList(playCard[0]).num !== 100 : playCard.every(card => card < 100))
                    const multipleExcludedPlayCards = morphoseAndJokerExcludedPlayCards.filter(playCard => {
                        if (playCard.length === 1) { return true } // 出单장OK
                        const cardNumCount = getSpecifiedCardNumCount(remainCards, poker.getIndexOfCardList(playCard[0]).num) // 获取플레이어手中该牌面的장数
                        const pureCount = cardNumCount - playCard.length // 플레이어手中该牌面的장数减去当前PLAY组合要打出的장数
                        return getRandom(0, pureCount) > 0 // 期望值希望플레이어至少保留1장该牌面的牌
                    })
                    if (multipleExcludedPlayCards.length > 0) {
                        return multipleExcludedPlayCards[Math.floor(Math.random() * multipleExcludedPlayCards.length)]
                    }
                }
                return excludedPlayCards[Math.floor(Math.random() * excludedPlayCards.length)] // 随机打出该过滤条件下的其中一种组合
            }
            i++
        }
    }
    else if (currentCard.length === 1) { // 牌池是单牌时
        if (game.currentCombo < 5 && getRandom(0, game.currentCombo) === 0) { // 콤보 수越低越倾向执行后续处理
            const cardStatus = getCardStatus(remainCards)
            if (getRandom(0, cardStatus.yaoguaiNum - playCards.length) > 0) { // 플레이어手中不能打出的요괴牌越多时越倾向于弃牌
                return []
            }
            const yaoguaiPlayCards = playCards.filter(playCard => playCard.every(card => poker.getIndexOfCardList(card).num < 20))
            if (yaoguaiPlayCards.length === 0 && getRandom(0, cardStatus.yaoguaiNum) > 0) { // 플레이어只能打出徒弟牌管上现在牌面时，플레이어手中요괴牌越多时越倾向于弃牌
                return []
            }
        }
    }
    playCards.sort((a, b) => {
        if (poker.getIndexOfCardList(a[0]).num !== poker.getIndexOfCardList(b[0]).num) { // 牌面不一致，按牌面升序排
            return poker.getIndexOfCardList(a[0]).num - poker.getIndexOfCardList(b[0]).num
        }
        return a.reduce((acr, cur) => acr + cur) - b.reduce((acr, cur) => acr + cur)  // 牌面一致，按牌序数和升序排
    })
    /** 目前暂定选出所有能打出的牌中牌面最小，牌序数和最小的组合打出。 */
    return playCards[0]
}

/** 
 * @typedef {object} CardStatus
 * @property {number} yaoguaiNum 요괴数量
 * @property {number} shasengNum 샤셍数量
 * @property {number} bajieNum 바지에数量
 * @property {number} wukongNum 오공数量
 * @property {number} tangsengNum 师傅数量
 * @property {number} jokerNum 리바운드数量
 * @property {number} bianshenNum 变形数量
 */

/** 
 * @summary 获取플레이어手中牌的状况。
 * @param {number[]} cards 플레이어手中的牌。
 * @returns {CardStatus} 플레이어手中牌的状况。
 */
function getCardStatus(cards) {
    /** @type {CardStatus} */
    const result = {
        yaoguaiNum: 0,
        shasengNum: 0,
        bajieNum: 0,
        wukongNum: 0,
        tangsengNum: 0,
        jokerNum: 0,
        bianshenNum: 0,
    }
    cards.forEach(card => {
        if (card >= 100) { result.bianshenNum += 1 }
        const cardNum = poker.getIndexOfCardList(card).num
        if (cardNum === 21) { result.shasengNum += 1 }
        else if (cardNum === 22) { result.bajieNum += 1 }
        else if (cardNum === 23) { result.wukongNum += 1 }
        else if (cardNum === 31) { result.tangsengNum += 1 }
        else if (cardNum === 100) { result.jokerNum += 1 }
        else { result.yaoguaiNum += 1 }
    })
    return result
}

/** 
 * @summary 获取플레이어手中牌的指定牌面的数量。
 * @param {number[]} remainCards 플레이어手中的牌。
 * @param {number} cardNum 牌面。
 * @returns {number} 指定牌面的数量。
 */
function getSpecifiedCardNumCount(remainCards, cardNum) {
    return remainCards.filter(card => poker.getIndexOfCardList(card).num === cardNum).length
}

module.exports = {
    strategy: strategy,
    getCardStatus: getCardStatus,
}