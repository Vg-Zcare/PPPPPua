/**
 * message.js
 * 负责消息处理、发送、接收、渲染等功能
 */

// 消息处理模块
const Message = (function() {
    // 消息选择相关状态
    let isSelectMode = false;
    let selectedMessages = [];
    
    // 定义测试模式标志，如果后端连接有问题，可以设置为true进行测试
    const TEST_MODE = false;
    // 使用相对路径，这样前端和后端可以在同一服务器上运行
    const API_URL = '/api';
    
    /**
     * 初始化消息处理模块
     */
    function init() {
        // 查找相关DOM元素
        const messagesElement = document.getElementById('chat-messages');
        
        // 如果找不到关键元素，则不初始化
        if (!messagesElement) {
            console.error('初始化消息模块失败：找不到必要的DOM元素');
            return;
        }
    }
    
    /**
     * 发送消息
     * @param {String} messageText 消息内容
     * @param {Object} currentUser 当前用户信息
     * @returns {Object|null} 发送的消息对象
     */
    function sendMessage(messageText) {
        if (!messageText || messageText.trim() === '') return null;
        
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) {
            console.error('发送消息失败：用户未登录');
            return null;
        }
        
        try {
            // 获取当前对话ID
            const currentConversationId = window.Conversation.getCurrentConversationId();
            if (!currentConversationId) {
                window.UI.showNotification('请先选择或创建一个对话', 'error');
                return null;
            }
            
            // 创建消息对象
            const messageId = window.Utils.generateId();
            const message = {
                id: messageId,
                text: messageText.trim(),
                sender: 'user',
                timestamp: new Date().toISOString()
            };
            
            // 添加消息到对话
            const success = window.Conversation.addMessage(message, currentUser.username);
            if (!success) {
                console.error('添加消息到对话失败');
                return null;
            }
            
            // 渲染消息
            const messagesElement = document.getElementById('chat-messages');
            if (messagesElement) {
                renderMessage(message, messagesElement);
                
                // 模拟回复
                simulateReply();
            }
            
            return message;
        } catch (error) {
            console.error('发送消息失败:', error);
            return null;
        }
    }
    
    /**
     * 渲染单条消息
     * @param {Object} message 消息对象
     * @param {HTMLElement} container 容器元素 
     */
    function renderMessage(message, container) {
        if (!message || !container) return;
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.dataset.id = message.id;
        
        const isUserMessage = message.sender === 'user';
        messageElement.classList.add(isUserMessage ? 'message-sent' : 'message-received');
        
        // 处理加载状态消息
        if (message.isLoading) {
            messageElement.classList.add('message-loading');
        }
        
        // 处理错误消息
        if (message.isError) {
            messageElement.classList.add('message-error');
        }
        
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        
        // 根据消息类型设置内容
        if (message.isLoading) {
            messageBubble.innerHTML = `<div class="loading-indicator"><span>.</span><span>.</span><span>.</span></div>${message.text}`;
        } else {
            messageBubble.textContent = message.text;
        }
        
        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        
        // 格式化时间
        const messageDate = new Date(message.timestamp);
        messageTime.textContent = messageDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const messageCheckbox = document.createElement('div');
        messageCheckbox.classList.add('message-checkbox');
        messageCheckbox.innerHTML = '<span>✓</span>';
        
        messageElement.appendChild(messageCheckbox);
        messageElement.appendChild(messageBubble);
        messageElement.appendChild(messageTime);
        
        container.appendChild(messageElement);
        
        // 滚动到底部
        container.scrollTop = container.scrollHeight;
        
        // 如果在选择模式，添加可选择类和事件
        if (isSelectMode) {
            messageElement.classList.add('selectable');
            messageElement.addEventListener('click', function(event) {
                toggleMessageSelection(event, messageElement);
            });
        }
    }
    
    /**
     * 调用后端模型API获取回复
     */
    function simulateReply() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // 获取当前对话
        const currentConversation = window.Conversation.getCurrentConversation();
        if (!currentConversation) return;
        
        // 获取对话设置
        const settings = currentConversation.settings || {};
        
        // 获取最后一条用户消息
        const userMessages = currentConversation.messages.filter(m => m.sender === 'user');
        if (userMessages.length === 0) return;
        
        const lastUserMessage = userMessages[userMessages.length - 1];
        
        // 显示加载状态或提示
        const messagesElement = document.getElementById('chat-messages');
        const loadingId = window.Utils.generateId();
        const loadingMessage = {
            id: loadingId,
            text: '正在思考中...',
            sender: 'bot',
            timestamp: new Date().toISOString(),
            isLoading: true
        };
        
        // 添加临时加载消息
        const tempElement = document.createElement('div');
        renderMessage(loadingMessage, tempElement);
        if (messagesElement) {
            messagesElement.appendChild(tempElement.firstChild);
            messagesElement.scrollTop = messagesElement.scrollHeight;
        }
        
        // 如果是测试模式，不调用API，直接返回测试响应
        if (TEST_MODE) {
            console.log('测试模式已启用，不调用API');
            setTimeout(() => {
                // 移除加载消息
                const loadingElement = document.querySelector(`.message[data-id="${loadingId}"]`);
                if (loadingElement && loadingElement.parentNode) {
                    loadingElement.parentNode.removeChild(loadingElement);
                }
                
                // 创建测试回复消息
                const replyId = window.Utils.generateId();
                const replyMessage = {
                    id: replyId,
                    text: `这是测试模式回复。你说: "${lastUserMessage.text}"`,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                };
                
                // 添加到当前对话
                window.Conversation.addMessage(replyMessage, currentUser.username);
                
                // 渲染消息
                if (messagesElement) {
                    renderMessage(replyMessage, messagesElement);
                }
            }, 1000);
            return;
        }
        
        // 准备发送到后端API的数据
        const apiUrl = API_URL;
        
        // 格式化设置信息为一段文本
        let formattedSettings = '';
        if (settings) {
            if (settings.scene) formattedSettings += `场景：${settings.scene}，`;
            if (settings.behavior) formattedSettings += `行为：${settings.behavior}，`;
            if (settings.partnerInfo) formattedSettings += `对方信息：${settings.partnerInfo}，`;
            if (settings.customSetting) formattedSettings += `自定义设置：${settings.customSetting}`;
            
            // 移除末尾多余的逗号和空格
            formattedSettings = formattedSettings.replace(/，\s*$/, '');
        }
        
        const requestData = {
            // 用户最新消息
            message: lastUserMessage.text,
            
            // 对话历史
            conversation_history: currentConversation.messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            })),
            
            // 格式化后的设置信息
            settings_text: formattedSettings
        };
        
        console.log('发送到后端的数据:', JSON.stringify(requestData));
        console.log('后端API URL:', apiUrl);
        
        // 调用后端API
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            console.log('收到后端响应状态:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('收到后端数据:', data);
            // 移除加载消息
            const loadingElement = document.querySelector(`.message[data-id="${loadingId}"]`);
            if (loadingElement && loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
            
            // 创建回复消息
            const replyId = window.Utils.generateId();
            const replyMessage = {
                id: replyId,
                text: data.response || '抱歉，模型没有返回有效回复。',
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            
            // 添加到当前对话
            window.Conversation.addMessage(replyMessage, currentUser.username);
            
            // 渲染消息
            if (messagesElement) {
                renderMessage(replyMessage, messagesElement);
            }
        })
        .catch(error => {
            console.error('调用模型API失败:', error);
            
            // 移除加载消息
            const loadingElement = document.querySelector(`.message[data-id="${loadingId}"]`);
            if (loadingElement && loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
            
            // 显示错误消息
            const errorId = window.Utils.generateId();
            const errorMessage = {
                id: errorId,
                text: `调用模型失败: ${error.message}`,
                sender: 'bot',
                timestamp: new Date().toISOString(),
                isError: true
            };
            
            // 添加到当前对话
            window.Conversation.addMessage(errorMessage, currentUser.username);
            
            // 渲染消息
            if (messagesElement) {
                renderMessage(errorMessage, messagesElement);
            }
        });
    }
    
    /**
     * 进入消息选择模式
     */
    function enterSelectMode() {
        isSelectMode = true;
        selectedMessages = [];
        
        // 隐藏下拉菜单
        const messageActionsDropdown = document.getElementById('message-actions-dropdown');
        if (messageActionsDropdown) {
            messageActionsDropdown.classList.remove('show');
        }
        
        // 显示工具栏
        const messageSelectionToolbar = document.getElementById('message-selection-toolbar');
        if (messageSelectionToolbar) {
            messageSelectionToolbar.classList.add('show');
        }
        
        // 更新选中消息计数
        updateSelectedCount();
        
        // 让所有消息可选择
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            message.classList.add('selectable');
            message.addEventListener('click', function(event) {
                toggleMessageSelection(event, message);
            });
        });
    }
    
    /**
     * 退出消息选择模式
     */
    function exitSelectMode() {
        isSelectMode = false;
        selectedMessages = [];
        
        // 隐藏工具栏
        const messageSelectionToolbar = document.getElementById('message-selection-toolbar');
        if (messageSelectionToolbar) {
            messageSelectionToolbar.classList.remove('show');
        }
        
        // 移除所有消息的可选择状态
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            message.classList.remove('selectable', 'selected');
            // 使用新的事件处理方式，需要明确移除旧的事件监听
            message.removeEventListener('click', function(event) {
                toggleMessageSelection(event, message);
            });
        });
    }
    
    /**
     * 切换消息选择状态
     * @param {Event} event 事件对象
     * @param {HTMLElement} messageElement 消息元素
     */
    function toggleMessageSelection(event, messageElement) {
        if (!isSelectMode || !messageElement) return;
        
        const messageId = messageElement.dataset.id;
        if (!messageId) return;
        
        event.stopPropagation(); // 阻止事件冒泡
        
        if (messageElement.classList.contains('selected')) {
            // 取消选择
            messageElement.classList.remove('selected');
            selectedMessages = selectedMessages.filter(id => id !== messageId);
        } else {
            // 选择消息
            messageElement.classList.add('selected');
            selectedMessages.push(messageId);
        }
        
        // 更新选中消息计数
        updateSelectedCount();
    }
    
    /**
     * 更新选中消息计数
     */
    function updateSelectedCount() {
        const selectedCountText = document.getElementById('selected-count');
        if (selectedCountText) {
            selectedCountText.textContent = `已选择 ${selectedMessages.length} 条消息`;
        }
    }
    
    /**
     * 删除选中的消息
     */
    function deleteSelectedMessages() {
        if (selectedMessages.length === 0) {
            window.UI.showNotification('请至少选择一条消息', 'info');
            return;
        }
        
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // 获取当前对话
        const currentConversation = window.Conversation.getCurrentConversation();
        if (!currentConversation) return;
        
        try {
            // 从当前对话中移除选中的消息
            const updatedMessages = currentConversation.messages.filter(
                message => !selectedMessages.includes(message.id)
            );
            
            // 更新对话的消息数组
            currentConversation.messages = updatedMessages;
            
            // 保存更改
            const success = window.Conversation.saveConversations(currentUser.username);
            if (!success) {
                console.error('保存对话数据失败');
                return;
            }
            
            // 重新加载消息
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.innerHTML = ''; // 清空现有消息
                
                // 重新渲染所有消息
                updatedMessages.forEach(message => {
                    renderMessage(message, chatMessages);
                });
            }
            
            // 退出选择模式
            exitSelectMode();
            
            window.UI.showNotification('已删除选中的消息', 'success');
        } catch (error) {
            console.error('删除消息失败:', error);
            window.UI.showNotification('删除消息失败', 'error');
        }
    }
    
    /**
     * 确认清空所有消息对话框
     */
    function confirmClearAllMessages() {
        const currentConversationId = window.Conversation.getCurrentConversationId();
        if (!currentConversationId) {
            window.UI.showNotification('请先选择一个对话', 'info');
            return;
        }
        
        // 隐藏消息操作下拉菜单
        const messageActionsDropdown = document.getElementById('message-actions-dropdown');
        if (messageActionsDropdown) {
            messageActionsDropdown.classList.remove('show');
        }
        
        // 显示确认对话框 - 这里需要调用app.js中的showConfirmDialog函数
        if (window.App && typeof window.App.showConfirmDialog === 'function') {
            window.App.showConfirmDialog(
                '确定要清空所有消息吗？此操作不可恢复。',
                'messages',
                clearAllMessages
            );
        } else {
            // 如果没有确认对话框功能，直接询问用户
            if (confirm('确定要清空所有消息吗？此操作不可恢复。')) {
                clearAllMessages();
            }
        }
    }
    
    /**
     * 清空所有消息
     */
    function clearAllMessages() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // 调用Conversation模块的清空消息功能
        const success = window.Conversation.clearAllMessages(currentUser.username);
        
        if (success) {
            window.UI.showNotification('已清空所有消息', 'success');
        } else {
            window.UI.showNotification('清空消息失败', 'error');
        }
    }
    
    /**
     * 发送消息后的处理
     * @param {HTMLElement} inputElement 输入框元素
     */
    function afterSendMessage(inputElement) {
        if (!inputElement) return;
        
        // 清空输入框
        inputElement.value = '';
        
        // 移动端自动收起键盘并滚动到底部
        if (window.innerWidth <= 768) {
            inputElement.blur();
            
            // 滚动到底部
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                setTimeout(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 100);
            }
        }
    }

    // 公开API
    return {
        init,
        sendMessage,
        renderMessage,
        simulateReply,
        enterSelectMode,
        exitSelectMode,
        toggleMessageSelection,
        updateSelectedCount,
        deleteSelectedMessages,
        confirmClearAllMessages,
        clearAllMessages,
        afterSendMessage
    };
})();

// 导出模块
window.Message = Message; 