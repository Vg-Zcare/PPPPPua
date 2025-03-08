/**
 * utils.js
 * 提供通用工具函数
 */

// 工具函数模块
const Utils = (function() {
    /**
     * 生成唯一ID
     * @returns {String} 唯一ID
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * 获取随机默认头像
     * @param {Array} avatars 可用头像数组，默认使用default-avatar.svg
     * @returns {String} 头像URL
     */
    function getRandomDefaultAvatar(avatars) {
        const defaultAvatars = avatars || ['default-avatar.svg'];
        return defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    }
    
    /**
     * 获取格式化的当前时间
     * @returns {String} 格式化后的时间字符串 (HH:MM)
     */
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    /**
     * 格式化日期时间
     * @param {String|Date} dateTime 日期时间字符串或Date对象
     * @param {Object} options 格式化选项
     * @returns {String} 格式化后的日期时间字符串
     */
    function formatDateTime(dateTime, options = {}) {
        const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
        
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        return date.toLocaleString(undefined, mergedOptions);
    }
    
    /**
     * 防抖函数：限制函数在一段时间内只执行一次
     * @param {Function} func 要执行的函数
     * @param {Number} wait 等待时间（毫秒）
     * @returns {Function} 包装后的函数
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    /**
     * 安全解析JSON
     * @param {String} jsonString JSON字符串
     * @param {*} defaultValue 解析失败时的默认返回值
     * @returns {*} 解析结果或默认值
     */
    function safeParseJSON(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('JSON解析失败:', error);
            return defaultValue;
        }
    }

    // 公开API
    return {
        generateId,
        getRandomDefaultAvatar,
        getCurrentTime,
        formatDateTime,
        debounce,
        safeParseJSON
    };
})();

// 导出模块
window.Utils = Utils; 