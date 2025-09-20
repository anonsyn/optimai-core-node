import { createStore } from './base-store'
import type { RewardData, RewardStoreData } from './types'

/**
 * Reward store for managing uptime rewards
 */
const store = createStore<RewardStoreData>({
  name: 'reward',
  defaults: {
    latest_reward: undefined,
    total_rewards: '0',
    reward_count: 0
  }
})

export const rewardStore = {
  /**
   * Save a new reward
   */
  saveReward(amount: string, timestamp?: number): RewardData {
    const rewardData: RewardData = {
      amount,
      timestamp: timestamp || Date.now()
    }

    // Update latest reward
    store.set('latest_reward', rewardData)

    // Update total rewards
    const currentTotal = store.get('total_rewards') || '0'
    const newTotal = (parseFloat(currentTotal) + parseFloat(amount)).toString()
    store.set('total_rewards', newTotal)

    // Increment reward count
    const currentCount = store.get('reward_count') || 0
    store.set('reward_count', currentCount + 1)

    return rewardData
  },

  /**
   * Get the latest reward
   */
  getLatestReward(): RewardData | undefined {
    return store.get('latest_reward')
  },

  /**
   * Get total accumulated rewards
   */
  getTotalRewards(): string {
    return store.get('total_rewards') || '0'
  },

  /**
   * Get formatted total rewards
   */
  getFormattedTotalRewards(): string {
    const total = store.get('total_rewards') || '0'
    const num = parseFloat(total)
    if (isNaN(num)) return '0.000000'
    return num.toFixed(6)
  },

  /**
   * Get number of rewards received
   */
  getRewardCount(): number {
    return store.get('reward_count') || 0
  },

  /**
   * Check if any rewards have been received
   */
  hasRewards(): boolean {
    return store.has('latest_reward') && store.get('latest_reward') !== undefined
  },

  /**
   * Clear all reward data
   */
  clearRewards() {
    store.clear()
  },

  /**
   * Get average reward amount
   */
  getAverageReward(): string {
    const count = store.get('reward_count') || 0
    if (count === 0) return '0'

    const total = parseFloat(store.get('total_rewards') || '0')
    const average = total / count
    return average.toFixed(6)
  },

  /**
   * Get reward statistics
   */
  getStatistics() {
    return {
      latestReward: store.get('latest_reward'),
      totalRewards: this.getFormattedTotalRewards(),
      rewardCount: store.get('reward_count') || 0,
      averageReward: this.getAverageReward()
    }
  },

  /**
   * Watch for changes
   */
  onDidChange(callback: (reward?: RewardData) => void) {
    return store.onDidChange('latest_reward', callback)
  }
}