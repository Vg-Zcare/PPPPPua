/**
 * conversation.js
 * 管理对话数据、创建和切换对话等功能
 */

// 对话管理模块
const Conversation = (function() {
    // 当前对话数据
    let conversations = [];
    let currentConversationId = null;
    
    // 对话设置
    let defaultSettings = {
        scene: '',
        behavior: '',
        partnerInfo: '',
        customSetting: ''
    };
    
    /**
     * 初始化对话管理器
     * @param {String} username 当前用户名
     */
    function init(username) {
        if (!username) {
            console.error('初始化对话失败: 用户名不能为空');
            return;
        }
        
        // 从本地存储加载对话
        loadConversations(username);
    }
    
    /**
     * 加载用户的对话数据
     * @param {String} username 用户名
     */
    function loadConversations(username) {
        if (!username) return;
        
        try {
            // 使用Storage模块加载数据
            conversations = window.Storage.loadConversations(username);
            
            // 重新渲染对话列表
            renderConversationsList();
            
            // 如果有对话，加载第一个
            if (conversations.length > 0) {
                switchConversation(conversations[0].id);
            }
        } catch (error) {
            console.error('加载对话数据失败:', error);
            conversations = [];
        }
    }
    
    /**
     * 保存对话数据
     * @param {String} username 用户名
     * @returns {Boolean} 是否保存成功
     */
    function saveConversations(username) {
        if (!username) return false;
        
        // 使用Storage模块保存数据
        return window.Storage.saveConversations(conversations, username);
    }
    
    /**
     * 创建新对话
     * @param {Object} conversationData 对话数据
     * @param {String} username 用户名
     * @returns {String|null} 新创建的对话ID或null（失败时）
     */
    function createNewConversation(conversationData, username) {
        if (!conversationData || !username) return null;
        
        try {
            const name = conversationData.name.trim();
            
            if (!name) {
                window.UI.showNotification('请输入对话名称', 'error');
                return null;
            }
            
            // 使用Utils生成ID
            const newId = window.Utils.generateId();
            
            const newConversation = {
                id: newId,
                name: name,
                avatar: conversationData.avatar || window.Utils.getRandomDefaultAvatar(),
                note: conversationData.note || '',
                settings: {...defaultSettings, ...conversationData.settings},
                messages: [],
                createdAt: new Date().toISOString(),
                lastMessage: null
            };
            
            conversations.push(newConversation);
            saveConversations(username);
            
            renderConversationsList();
            switchConversation(newId);
            
            return newId;
        } catch (error) {
            console.error('创建新对话失败:', error);
            return null;
        }
    }
    
    /**
     * 切换当前对话
     * @param {String} conversationId 要切换到的对话ID
     * @param {HTMLElement} messagesElement 消息显示区域元素
     * @param {HTMLElement} sidebarElement 侧边栏元素
     * @param {Function} renderMessageCallback 渲染消息的回调函数
     * @returns {Object|null} 切换后的对话数据或null
     */
    function switchConversation(conversationId, messagesElement, sidebarElement, renderMessageCallback) {
        currentConversationId = conversationId;
        
        if (!messagesElement) return null;
        
        // 清空聊天区域
        messagesElement.innerHTML = '';
        
        // 清除所有对话的选中状态
        const conversationItems = document.querySelectorAll('.conversation-item');
        conversationItems.forEach(item => item.classList.remove('active'));
        
        // 设置当前对话的选中状态
        const currentItem = document.querySelector(`.conversation-item[data-id="${conversationId}"]`);
        if (currentItem) currentItem.classList.add('active');
        
        // 获取并显示当前对话的消息
        const currentConversation = conversations.find(c => c.id === conversationId);
        if (currentConversation) {
            // 更新当前对话信息
            updateCurrentConversationInfo(currentConversation);
            
            // 加载对话设置
            loadConversationSettings(currentConversation);
            
            // 加载对话消息
            if (renderMessageCallback && typeof renderMessageCallback === 'function') {
                loadConversationMessages(currentConversation, messagesElement, renderMessageCallback);
            }
        }
        
        // 在移动设备上，切换对话后收起侧边栏
        if (window.innerWidth <= 768 && sidebarElement) {
            sidebarElement.classList.remove('expanded');
        }
        
        return currentConversation;
    }
    
    /**
     * 更新当前对话信息
     * @param {Object} conversation 对话数据
     */
    function updateCurrentConversationInfo(conversation) {
        if (!conversation) return;
        
        const currentAvatar = document.getElementById('current-avatar');
        const currentName = document.getElementById('current-name');
        
        if (currentAvatar) currentAvatar.src = conversation.avatar;
        if (currentName) currentName.textContent = conversation.name;
    }
    
    /**
     * 加载对话设置
     * @param {Object} conversation 对话数据
     */
    function loadConversationSettings(conversation) {
        if (!conversation || !conversation.settings) return;
        
        defaultSettings = {...conversation.settings};
        
        // 更新设置表单
        const sceneInput = document.getElementById('scene');
        const behaviorInput = document.getElementById('behavior');
        const partnerInfoInput = document.getElementById('partner-info');
        const customSettingInput = document.getElementById('custom-setting');
        
        if (sceneInput) sceneInput.value = defaultSettings.scene || '';
        if (behaviorInput) behaviorInput.value = defaultSettings.behavior || '';
        if (partnerInfoInput) partnerInfoInput.value = defaultSettings.partnerInfo || '';
        if (customSettingInput) customSettingInput.value = defaultSettings.customSetting || '';
    }
    
    /**
     * 加载对话消息
     * @param {Object} conversation 对话数据
     * @param {HTMLElement} messagesElement 消息显示区域元素
     * @param {Function} renderMessageCallback 渲染消息的回调函数
     */
    function loadConversationMessages(conversation, messagesElement, renderMessageCallback) {
        if (!conversation || !conversation.messages || !messagesElement) return;
        
        // 清空现有消息
        messagesElement.innerHTML = '';
        
        // 使用提供的回调函数渲染所有消息
        if (renderMessageCallback && typeof renderMessageCallback === 'function') {
            conversation.messages.forEach(message => {
                renderMessageCallback(message, messagesElement);
            });
            
            // 滚动到底部
            window.UI.adjustChatAreaHeight(messagesElement);
        }
    }
    
    /**
     * 渲染对话列表
     */
    function renderConversationsList() {
        const conversationsList = document.getElementById('conversations-list');
        if (!conversationsList) return;
        
        conversationsList.innerHTML = '';
        
        conversations.forEach(conversation => {
            const conversationItem = document.createElement('div');
            conversationItem.classList.add('conversation-item');
            conversationItem.dataset.id = conversation.id;
            
            if (conversation.id === currentConversationId) {
                conversationItem.classList.add('active');
            }
            
            const avatar = document.createElement('img');
            avatar.classList.add('conversation-avatar');
            avatar.src = conversation.avatar;
            avatar.alt = conversation.name;
            
            const info = document.createElement('div');
            info.classList.add('conversation-info');
            
            const name = document.createElement('div');
            name.classList.add('conversation-name');
            name.textContent = conversation.name;
            
            const note = document.createElement('div');
            note.classList.add('conversation-note');
            note.textContent = conversation.note || '';
            
            info.appendChild(name);
            info.appendChild(note);
            
            conversationItem.appendChild(avatar);
            conversationItem.appendChild(info);
            
            conversationItem.addEventListener('click', function() {
                const messagesElement = document.getElementById('chat-messages');
                const sidebarElement = document.getElementById('conversations-sidebar');
                switchConversation(conversation.id, messagesElement, sidebarElement, window.Message.renderMessage);
            });
            
            conversationsList.appendChild(conversationItem);
        });
    }
    
    /**
     * 更新对话设置
     * @param {Object} settings 新的设置
     * @param {String} username 用户名
     * @returns {Boolean} 是否成功
     */
    function updateSettings(settings, username) {
        if (!currentConversationId || !username) return false;
        
        try {
            defaultSettings = {...defaultSettings, ...settings};
            
            // 保存设置到当前对话
            const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
            if (conversationIndex !== -1) {
                conversations[conversationIndex].settings = {...defaultSettings};
                saveConversations(username);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('更新设置失败:', error);
            return false;
        }
    }
    
    /**
     * 保存对话详情
     * @param {Object} details 对话详情数据
     * @param {String} username 用户名
     * @returns {Boolean} 是否成功
     */
    function saveConversationDetails(details, username) {
        if (!currentConversationId || !details || !username) return false;
        
        try {
            const name = details.name.trim();
            if (!name) {
                window.UI.showNotification('对话名称不能为空', 'error');
                return false;
            }
            
            const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
            if (conversationIndex !== -1) {
                conversations[conversationIndex].name = name;
                conversations[conversationIndex].avatar = details.avatar;
                conversations[conversationIndex].note = details.note.trim();
                
                saveConversations(username);
                renderConversationsList();
                
                // 更新当前对话信息
                updateCurrentConversationInfo(conversations[conversationIndex]);
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('保存对话详情失败:', error);
            return false;
        }
    }
    
    /**
     * 删除当前对话
     * @param {String} username 用户名
     * @returns {Boolean} 是否成功
     */
    function deleteConversation(username) {
        if (!currentConversationId || !username) return false;
        
        try {
            // 找到当前对话的索引
            const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
            if (conversationIndex === -1) return false;
            
            // 从数组中移除当前对话
            conversations.splice(conversationIndex, 1);
            
            // 保存更改
            saveConversations(username);
            
            // 重新渲染对话列表
            renderConversationsList();
            
            // 如果还有其他对话，切换到第一个对话
            const messagesElement = document.getElementById('chat-messages');
            if (conversations.length > 0) {
                switchConversation(conversations[0].id, messagesElement);
            } else {
                // 没有对话了，清空聊天区域和当前对话ID
                if (messagesElement) messagesElement.innerHTML = '';
                currentConversationId = null;
                
                const currentAvatar = document.getElementById('current-avatar');
                const currentName = document.getElementById('current-name');
                
                if (currentAvatar) currentAvatar.src = window.Utils.getRandomDefaultAvatar();
                if (currentName) currentName.textContent = '未选择对话';
            }
            
            return true;
        } catch (error) {
            console.error('删除对话失败:', error);
            return false;
        }
    }
    
    /**
     * 添加消息到当前对话
     * @param {Object} message 消息对象
     * @param {String} username 用户名
     * @returns {Boolean} 是否成功
     */
    function addMessage(message, username) {
        if (!currentConversationId || !message || !username) return false;
        
        try {
            // 找到当前对话
            const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
            if (conversationIndex === -1) return false;
            
            // 添加消息
            conversations[conversationIndex].messages.push(message);
            
            // 更新最后一条消息
            conversations[conversationIndex].lastMessage = {
                text: message.text,
                timestamp: message.timestamp
            };
            
            // 保存更改
            saveConversations(username);
            
            return true;
        } catch (error) {
            console.error('添加消息失败:', error);
            return false;
        }
    }
    
    /**
     * 获取当前对话ID
     * @returns {String|null} 当前对话ID
     */
    function getCurrentConversationId() {
        return currentConversationId;
    }
    
    /**
     * 获取当前对话数据
     * @returns {Object|null} 当前对话数据
     */
    function getCurrentConversation() {
        if (!currentConversationId) return null;
        return conversations.find(c => c.id === currentConversationId) || null;
    }
    
    /**
     * 获取所有对话
     * @returns {Array} 对话数组
     */
    function getAllConversations() {
        return [...conversations];
    }
    
    /**
     * 清空当前对话的所有消息
     * @param {String} username 用户名
     * @returns {Boolean} 是否成功
     */
    function clearAllMessages(username) {
        if (!currentConversationId || !username) return false;
        
        try {
            const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
            if (conversationIndex === -1) return false;
            
            // 清空消息数组
            conversations[conversationIndex].messages = [];
            
            // 清除最后一条消息
            conversations[conversationIndex].lastMessage = null;
            
            // 保存更改
            saveConversations(username);
            
            // 清空聊天区域
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) chatMessages.innerHTML = '';
            
            return true;
        } catch (error) {
            console.error('清空消息失败:', error);
            return false;
        }
    }

    // 公开API
    return {
        init,
        loadConversations,
        saveConversations,
        createNewConversation,
        switchConversation,
        updateCurrentConversationInfo,
        loadConversationSettings,
        loadConversationMessages,
        renderConversationsList,
        updateSettings,
        saveConversationDetails,
        deleteConversation,
        addMessage,
        getCurrentConversationId,
        getCurrentConversation,
        getAllConversations,
        clearAllMessages
    };
})();

// 导出模块
window.Conversation = Conversation; 