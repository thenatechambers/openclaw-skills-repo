/**
 * Multi-User Memory Isolation for OpenClaw
 * Prevents context cross-contamination between team members
 */

const USER_TAG_PREFIX = "user:";

/**
 * Extract user ID from incoming message metadata
 */
function extractUserId(context) {
  const { channel, rawEvent } = context;
  
  // Slack
  if (channel === 'slack' && rawEvent?.user) {
    return rawEvent.user;
  }
  
  // Discord
  if (channel === 'discord' && rawEvent?.author?.id) {
    return rawEvent.author.id;
  }
  
  // Telegram
  if (channel === 'telegram' && rawEvent?.from?.id) {
    return String(rawEvent.from.id);
  }
  
  // Custom / Environment
  if (process.env.USER_ID) {
    return process.env.USER_ID;
  }
  
  // Fallback: anonymous session
  return 'anonymous';
}

/**
 * Check if user is admin
 */
function isAdmin(userId, config = {}) {
  const admins = config.admin_users || [];
  return admins.includes(userId);
}

/**
 * Get memory filter for current user
 */
function getMemoryFilter(userId, config = {}) {
  const sharedTags = (config.shared_tags || [])
    .map(tag => `tag:${tag}`)
    .join(' OR ');
  
  const userTag = `${USER_TAG_PREFIX}${userId}`;
  
  if (sharedTags) {
    return `tag:${userTag} OR ${sharedTags}`;
  }
  return `tag:${userTag}`;
}

/**
 * Tag memory with user ID
 */
function tagMemory(content, userId, config = {}) {
  const template = config.tag_template || "user:{user_id}";
  const tag = template.replace('{user_id}', userId);
  
  return {
    content,
    tags: [tag, ...(config.shared_tags || [])],
    metadata: {
      user_id: userId,
      tagged_at: new Date().toISOString()
    }
  };
}

module.exports = {
  extractUserId,
  isAdmin,
  getMemoryFilter,
  tagMemory,
  USER_TAG_PREFIX
};
