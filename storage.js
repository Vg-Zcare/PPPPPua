/**
 * storage.js
 * 负责本地存储、数据持久化相关功能
 */

// 存储模块
const Storage = (function() {
    /**
     * 保存对话数据到本地存储
     * @param {Array} conversations 对话数据数组
     * @param {String} username 用户名，用于隔离不同用户的数据
     * @returns {Boolean} 是否保存成功
     */
    function saveConversations(conversations, username) {
        try {
            if (!username) {
                console.error('保存对话失败: 用户名不能为空');
                return false;
            }
            
            // 获取基于当前URL路径和用户名的存储键名
            const storageKey = getStorageKey(`chatConversations_${username}`);
            localStorage.setItem(storageKey, JSON.stringify(conversations));
            return true;
        } catch (error) {
            console.error('保存对话失败:', error);
            return false;
        }
    }
    
    /**
     * 从本地存储加载对话数据
     * @param {String} username 用户名，用于隔离不同用户的数据
     * @returns {Array} 对话数据数组，加载失败则返回空数组
     */
    function loadConversations(username) {
        try {
            if (!username) {
                console.error('加载对话失败: 用户名不能为空');
                return [];
            }
            
            // 获取基于当前URL路径和用户名的存储键名
            const storageKey = getStorageKey(`chatConversations_${username}`);
            const savedConversations = localStorage.getItem(storageKey);
            
            if (savedConversations) {
                return JSON.parse(savedConversations);
            }
            
            return [];
        } catch (error) {
            console.error('加载对话失败:', error);
            return [];
        }
    }
    
    /**
     * 生成基于当前URL路径的存储键名，避免不同项目间的冲突
     * @param {String} baseKey 基础键名
     * @returns {String} 组合后的存储键名
     */
    function getStorageKey(baseKey) {
        // 获取当前页面URL的路径名，用作命名空间
        // 这样可以避免不同GitHub Pages项目之间的本地存储冲突
        const pathName = window.location.pathname.replace(/\//g, '_');
        return `${pathName}_${baseKey}`;
    }
    
    /**
     * 清除指定用户的所有对话数据
     * @param {String} username 用户名
     * @returns {Boolean} 是否清除成功
     */
    function clearUserData(username) {
        try {
            if (!username) {
                return false;
            }
            
            const storageKey = getStorageKey(`chatConversations_${username}`);
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('清除用户数据失败:', error);
            return false;
        }
    }

    // 公开API
    return {
        saveConversations,
        loadConversations,
        getStorageKey,
        clearUserData
    };
})();

// 导出模块
window.Storage = Storage; 