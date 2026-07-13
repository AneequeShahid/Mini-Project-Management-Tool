import { FeatureFlag } from "../models/featureFlag.js";

export const featureFlagService = {
  async isEnabled(key, user) {
    const flag = await FeatureFlag.findOne({ key });
    if (!flag) return false;
    if (!flag.enabled) return false;

    // Role-based check
    if (flag.rules?.roles && !flag.rules.roles.includes(user.role)) {
      return false;
    }

    // Rollout check (Deterministic based on userId)
    if (flag.rolloutPercentage < 100) {
      const hash = this.simpleHash(user._id.toString());
      if (hash > flag.rolloutPercentage) return false;
    }

    return true;
  },

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 100;
  },

  async setFlag(key, config) {
    return await FeatureFlag.findOneAndUpdate(
      { key },
      { ...config },
      { upsert: true, new: true }
    );
  }
};
