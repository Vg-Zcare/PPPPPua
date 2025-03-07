document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素 - 聊天功能
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const applySettingsButton = document.getElementById('apply-settings');
    
    // 获取DOM元素 - 对话管理
    const conversationsSidebar = document.getElementById('conversations-sidebar');
    const conversationsList = document.getElementById('conversations-list');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const newConversationBtn = document.getElementById('new-conversation-btn');
    const newConversationModal = document.getElementById('new-conversation-modal');
    const closeNewConversationModal = document.getElementById('close-new-conversation-modal');
    const createConversationBtn = document.getElementById('create-conversation-btn');
    const cancelCreateBtn = document.getElementById('cancel-create-btn');
    const newConversationName = document.getElementById('new-conversation-name');
    const newAvatarPreview = document.getElementById('new-avatar-preview');
    const selectAvatarBtn = document.getElementById('select-avatar-btn');
    const newAvatarUpload = document.getElementById('new-avatar-upload');
    const newConversationNote = document.getElementById('new-conversation-note');
    
    // 获取DOM元素 - 对话详情
    const conversationDetails = document.getElementById('conversation-details');
    const detailsBackButton = document.getElementById('details-back-button');
    const detailsAvatar = document.getElementById('details-avatar');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarUpload = document.getElementById('avatar-upload');
    const detailsName = document.getElementById('details-name');
    const detailsNote = document.getElementById('details-note');
    const saveDetailsBtn = document.getElementById('save-details-btn');
    const continueChatBtn = document.getElementById('continue-chat-btn');
    const viewDetailsBtn = document.getElementById('view-details-btn');
    const deleteConversationBtn = document.getElementById('delete-conversation-btn');
    
    // 获取DOM元素 - 当前对话信息
    const currentAvatar = document.getElementById('current-avatar');
    const currentName = document.getElementById('current-name');
    
    // 获取DOM元素 - 消息操作
    const messageActionsBtn = document.getElementById('message-actions-btn');
    const messageActionsDropdown = document.getElementById('message-actions-dropdown');
    const selectMessagesBtn = document.getElementById('select-messages-btn');
    const clearAllMessagesBtn = document.getElementById('clear-all-messages-btn');
    const messageSelectionToolbar = document.getElementById('message-selection-toolbar');
    const selectedCountText = document.getElementById('selected-count');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const cancelSelectionBtn = document.getElementById('cancel-selection-btn');
    
    // 获取DOM元素 - 确认删除模态框
    const confirmDeleteModal = document.getElementById('confirm-delete-modal');
    const closeConfirmModal = document.getElementById('close-confirm-modal');
    const confirmDeleteMessage = document.getElementById('confirm-delete-message');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    
    // 聊天设置
    let chatSettings = {
        scene: '',
        behavior: '',
        partnerInfo: '',
        customSetting: ''
    };
    
    // 对话数据
    let conversations = [];
    let currentConversationId = null;
    
    // 消息选择模式
    let isSelectMode = false;
    let selectedMessages = [];
    let deleteMode = ''; // 'messages' 或 'conversation'
    
    // 默认头像 - 使用本地资源而非CDN链接
    const defaultAvatars = [
        'default-avatar.svg'
    ];
    
    // 初始化
    init();
    
    function init() {
        // 添加事件监听器 - 聊天功能
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', function(e) {
            // 按下回车键发送消息（不按Shift）
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // 阻止默认的换行行为
                sendMessage();
            }
        });
        
        applySettingsButton.addEventListener('click', updateSettings);
        
        // 添加事件监听器 - 对话管理
        sidebarToggle.addEventListener('click', toggleSidebar);
        newConversationBtn.addEventListener('click', openNewConversationModal);
        closeNewConversationModal.addEventListener('click', closeModal);
        cancelCreateBtn.addEventListener('click', closeModal);
        createConversationBtn.addEventListener('click', createNewConversation);
        selectAvatarBtn.addEventListener('click', () => newAvatarUpload.click());
        newAvatarUpload.addEventListener('change', handleNewAvatarUpload);
        
        // 添加事件监听器 - 对话详情
        detailsBackButton.addEventListener('click', hideConversationDetails);
        changeAvatarBtn.addEventListener('click', () => avatarUpload.click());
        avatarUpload.addEventListener('change', handleAvatarUpload);
        saveDetailsBtn.addEventListener('click', saveConversationDetails);
        continueChatBtn.addEventListener('click', hideConversationDetails);
        viewDetailsBtn.addEventListener('click', showConversationDetails);
        deleteConversationBtn.addEventListener('click', confirmDeleteConversation);
        
        // 添加事件监听器 - 消息操作
        messageActionsBtn.addEventListener('click', toggleMessageActionsDropdown);
        document.addEventListener('click', closeDropdownOnClickOutside);
        selectMessagesBtn.addEventListener('click', enterSelectMode);
        clearAllMessagesBtn.addEventListener('click', confirmClearAllMessages);
        deleteSelectedBtn.addEventListener('click', deleteSelectedMessages);
        cancelSelectionBtn.addEventListener('click', exitSelectMode);
        
        // 添加事件监听器 - 确认删除模态框
        closeConfirmModal.addEventListener('click', closeConfirmDeleteModal);
        cancelDeleteBtn.addEventListener('click', closeConfirmDeleteModal);
        confirmDeleteBtn.addEventListener('click', executeDelete);
        
        // 加载保存的对话
        loadConversations();
        
        // 添加欢迎消息
        if (!currentConversationId && !conversations.length) {
            addMessage('你好！我是你的聊天助手。请在左侧设置对话参数，然后开始我们的对话。', 'received');
        }
    }
    
    // 更新聊天设置
    function updateSettings() {
        chatSettings = {
            scene: document.getElementById('scene').value,
            behavior: document.getElementById('behavior').value,
            partnerInfo: document.getElementById('partner-info').value,
            customSetting: document.getElementById('custom-setting').value
        };
        
        // 显示设置已更新的消息
        addMessage('设置已更新！现在我们可以基于新的设置进行对话。', 'received');
        
        // 可以在这里添加逻辑，将设置发送到后端或API
        console.log('聊天设置已更新:', chatSettings);
        
        // 保存当前对话的设置
        if (currentConversationId) {
            const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
            if (conversationIndex !== -1) {
                conversations[conversationIndex].settings = {...chatSettings};
                saveConversations();
            }
        }
    }
    
    // 发送消息
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // 添加用户消息到聊天区域
            addMessage(message, 'sent');
            
            // 清空输入框
            messageInput.value = '';
            
            // 模拟接收回复（在实际应用中，这里会调用API获取回复）
            setTimeout(() => {
                simulateReply(message);
            }, 1000);
            
            // 保存消息到当前对话
            if (currentConversationId) {
                const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
                if (conversationIndex !== -1) {
                    if (!conversations[conversationIndex].messages) {
                        conversations[conversationIndex].messages = [];
                    }
                    
                    conversations[conversationIndex].messages.push({
                        id: generateId(),
                        text: message,
                        type: 'sent',
                        time: getCurrentTime()
                    });
                    
                    saveConversations();
                }
            }
        }
    }
    
    // 添加消息到聊天区域
    function addMessage(text, type) {
        const messageId = generateId();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `message-${type}`);
        messageElement.dataset.id = messageId;
        
        // 如果在选择模式下，添加选择功能
        if (isSelectMode) {
            messageElement.classList.add('selectable');
            messageElement.innerHTML = `<input type="checkbox" class="message-checkbox">`;
            messageElement.addEventListener('click', toggleMessageSelection);
        }
        
        const messageText = document.createElement('div');
        messageText.textContent = text;
        messageElement.appendChild(messageText);
        
        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        messageTime.textContent = getCurrentTime();
        messageElement.appendChild(messageTime);
        
        chatMessages.appendChild(messageElement);
        
        // 滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 保存接收到的消息到当前对话
        if (type === 'received' && currentConversationId) {
            const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
            if (conversationIndex !== -1) {
                if (!conversations[conversationIndex].messages) {
                    conversations[conversationIndex].messages = [];
                }
                
                conversations[conversationIndex].messages.push({
                    id: messageId,
                    text: text,
                    type: 'received',
                    time: getCurrentTime()
                });
                
                saveConversations();
            }
        }
        
        return messageId;
    }
    
    // 获取当前时间
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // 模拟回复（在实际应用中，这会被API调用替代）
    function simulateReply(userMessage) {
        // 这里是一个简单的回复逻辑，实际应用中会更复杂
        let reply = '';
        
        // 根据设置和用户消息生成回复
        if (chatSettings.scene || chatSettings.behavior || chatSettings.partnerInfo) {
            reply = `基于设置的回复：\n`;
            if (chatSettings.scene) reply += `场景：${chatSettings.scene}\n`;
            if (chatSettings.behavior) reply += `行为：${chatSettings.behavior}\n`;
            if (chatSettings.partnerInfo) reply += `对方信息：${chatSettings.partnerInfo}\n`;
            if (chatSettings.customSetting) reply += `自定义设置：${chatSettings.customSetting}\n`;
            reply += `\n针对"${userMessage}"的回复是：这是一个模拟回复，在实际应用中，这里会根据设置和用户输入生成更智能的回复。`;
        } else {
            reply = `你说："${userMessage}"。这是一个模拟回复，在实际应用中，这里会连接到后端API获取真实回复。`;
        }
        
        // 添加回复到聊天区域
        addMessage(reply, 'received');
    }
    
    // 切换侧边栏展开/折叠
    function toggleSidebar() {
        conversationsSidebar.classList.toggle('expanded');
        
        // 更新切换按钮图标
        const toggleIcon = sidebarToggle.querySelector('.toggle-icon');
        if (conversationsSidebar.classList.contains('expanded')) {
            toggleIcon.textContent = '▶';
        } else {
            toggleIcon.textContent = '◀';
        }
    }
    
    // 打开新建对话模态框
    function openNewConversationModal() {
        // 重置表单
        newConversationName.value = '';
        newConversationNote.value = '';
        newAvatarPreview.src = getRandomDefaultAvatar();
        
        // 显示模态框
        newConversationModal.style.display = 'flex';
    }
    
    // 关闭模态框
    function closeModal() {
        newConversationModal.style.display = 'none';
    }
    
    // 创建新对话
    function createNewConversation() {
        const name = newConversationName.value.trim();
        if (!name) {
            alert('请输入对话名称');
            return;
        }
        
        const newConversation = {
            id: generateId(),
            name: name,
            avatar: newAvatarPreview.src,
            note: newConversationNote.value.trim(),
            settings: {...chatSettings},
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        // 添加到对话列表
        conversations.push(newConversation);
        
        // 保存对话
        saveConversations();
        
        // 渲染对话列表
        renderConversationsList();
        
        // 切换到新对话
        switchConversation(newConversation.id);
        
        // 关闭模态框
        closeModal();
    }
    
    // 处理新头像上传
    function handleNewAvatarUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newAvatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    // 处理头像上传（对话详情）
    function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                detailsAvatar.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    // 显示对话详情
    function showConversationDetails() {
        if (!currentConversationId) {
            alert('请先选择或创建一个对话');
            return;
        }
        
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation) {
            detailsAvatar.src = conversation.avatar;
            detailsName.value = conversation.name;
            detailsNote.value = conversation.note || '';
            
            conversationDetails.style.display = 'flex';
        }
    }
    
    // 隐藏对话详情
    function hideConversationDetails() {
        conversationDetails.style.display = 'none';
    }
    
    // 保存对话详情
    function saveConversationDetails() {
        if (!currentConversationId) return;
        
        const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
        if (conversationIndex !== -1) {
            conversations[conversationIndex].name = detailsName.value.trim();
            conversations[conversationIndex].avatar = detailsAvatar.src;
            conversations[conversationIndex].note = detailsNote.value.trim();
            
            // 更新UI
            renderConversationsList();
            updateCurrentConversationInfo(conversations[conversationIndex]);
            
            // 保存对话
            saveConversations();
            
            // 隐藏详情面板
            hideConversationDetails();
        }
    }
    
    // 切换对话
    function switchConversation(conversationId) {
        // 退出选择模式（如果正在选择）
        if (isSelectMode) {
            exitSelectMode();
        }
        
        // 移除之前的活动状态
        const activeItems = conversationsList.querySelectorAll('.conversation-item.active');
        activeItems.forEach(item => item.classList.remove('active'));
        
        // 设置当前对话ID
        currentConversationId = conversationId;
        
        // 找到对话
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            // 更新UI
            updateCurrentConversationInfo(conversation);
            
            // 加载对话设置
            loadConversationSettings(conversation);
            
            // 加载对话消息
            loadConversationMessages(conversation);
            
            // 设置活动状态
            const conversationItem = conversationsList.querySelector(`[data-id="${conversationId}"]`);
            if (conversationItem) {
                conversationItem.classList.add('active');
            }
        }
    }
    
    // 更新当前对话信息
    function updateCurrentConversationInfo(conversation) {
        currentAvatar.src = conversation.avatar;
        currentName.textContent = conversation.name;
    }
    
    // 加载对话设置
    function loadConversationSettings(conversation) {
        if (conversation.settings) {
            document.getElementById('scene').value = conversation.settings.scene || '';
            document.getElementById('behavior').value = conversation.settings.behavior || '';
            document.getElementById('partner-info').value = conversation.settings.partnerInfo || '';
            document.getElementById('custom-setting').value = conversation.settings.customSetting || '';
            
            // 更新内存中的设置
            chatSettings = {...conversation.settings};
        }
    }
    
    // 加载对话消息
    function loadConversationMessages(conversation) {
        // 清空聊天区域
        chatMessages.innerHTML = '';
        
        // 加载消息
        if (conversation.messages && conversation.messages.length > 0) {
            conversation.messages.forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', `message-${message.type}`);
                messageElement.dataset.id = message.id || generateId();
                
                const messageText = document.createElement('div');
                messageText.textContent = message.text;
                messageElement.appendChild(messageText);
                
                const messageTime = document.createElement('div');
                messageTime.classList.add('message-time');
                messageTime.textContent = message.time;
                messageElement.appendChild(messageTime);
                
                chatMessages.appendChild(messageElement);
            });
            
            // 滚动到最新消息
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            // 添加欢迎消息
            addMessage(`你好！这是与 ${conversation.name} 的新对话。`, 'received');
        }
    }
    
    // 渲染对话列表
    function renderConversationsList() {
        // 清空列表
        conversationsList.innerHTML = '';
        
        // 按创建时间排序（最新的在前面）
        const sortedConversations = [...conversations].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // 添加对话项
        sortedConversations.forEach(conversation => {
            const conversationItem = document.createElement('div');
            conversationItem.classList.add('conversation-item');
            conversationItem.dataset.id = conversation.id;
            
            if (conversation.id === currentConversationId) {
                conversationItem.classList.add('active');
            }
            
            conversationItem.innerHTML = `
                <img class="conversation-avatar" src="${conversation.avatar}" alt="${conversation.name}">
                <div class="conversation-info">
                    <div class="conversation-name">${conversation.name}</div>
                    ${conversation.note ? `<div class="conversation-note">${conversation.note}</div>` : ''}
                </div>
            `;
            
            conversationItem.addEventListener('click', () => switchConversation(conversation.id));
            
            conversationsList.appendChild(conversationItem);
        });
    }
    
    // 保存对话到本地存储
    function saveConversations() {
        try {
            // 获取基于当前URL路径的存储键名
            const storageKey = getStorageKey('chatConversations');
            localStorage.setItem(storageKey, JSON.stringify(conversations));
        } catch (error) {
            console.error('保存对话失败:', error);
            // 可以在这里添加错误处理逻辑，如显示错误通知
        }
    }
    
    // 从本地存储加载对话
    function loadConversations() {
        try {
            // 获取基于当前URL路径的存储键名，以避免不同GitHub Pages项目之间的冲突
            const storageKey = getStorageKey('chatConversations');
            const savedConversations = localStorage.getItem(storageKey);
            
            if (savedConversations) {
                conversations = JSON.parse(savedConversations);
                renderConversationsList();
                
                // 如果有对话，加载第一个
                if (conversations.length > 0) {
                    switchConversation(conversations[0].id);
                }
            }
        } catch (error) {
            console.error('加载对话失败:', error);
            // 如果加载失败，初始化为空数组
            conversations = [];
        }
    }
    
    // 获取基于当前URL路径的存储键名
    function getStorageKey(baseKey) {
        // 获取当前页面URL的路径名，用作命名空间
        // 这样可以避免不同GitHub Pages项目之间的本地存储冲突
        const pathName = window.location.pathname.replace(/\//g, '_');
        return `${pathName}_${baseKey}`;
    }
    
    // 生成唯一ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // 获取随机默认头像
    function getRandomDefaultAvatar() {
        return defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    }
    
    // 切换消息操作下拉菜单
    function toggleMessageActionsDropdown(event) {
        event.stopPropagation();
        messageActionsDropdown.classList.toggle('show');
    }
    
    // 点击外部时关闭下拉菜单
    function closeDropdownOnClickOutside(event) {
        if (!messageActionsBtn.contains(event.target) && !messageActionsDropdown.contains(event.target)) {
            messageActionsDropdown.classList.remove('show');
        }
    }
    
    // 进入消息选择模式
    function enterSelectMode() {
        if (!currentConversationId) {
            alert('请先选择一个对话');
            return;
        }
        
        isSelectMode = true;
        selectedMessages = [];
        messageActionsDropdown.classList.remove('show');
        
        // 显示选择工具栏
        messageSelectionToolbar.classList.add('show');
        updateSelectedCount();
        
        // 使所有消息可选择
        const allMessages = chatMessages.querySelectorAll('.message');
        allMessages.forEach(message => {
            message.classList.add('selectable');
            
            // 添加复选框
            if (!message.querySelector('.message-checkbox')) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'message-checkbox';
                message.insertBefore(checkbox, message.firstChild);
            }
            
            // 添加点击事件
            message.addEventListener('click', toggleMessageSelection);
        });
    }
    
    // 退出消息选择模式
    function exitSelectMode() {
        isSelectMode = false;
        selectedMessages = [];
        
        // 隐藏选择工具栏
        messageSelectionToolbar.classList.remove('show');
        
        // 移除所有消息的可选择状态
        const allMessages = chatMessages.querySelectorAll('.message');
        allMessages.forEach(message => {
            message.classList.remove('selectable', 'selected');
            
            // 移除复选框
            const checkbox = message.querySelector('.message-checkbox');
            if (checkbox) {
                checkbox.checked = false;
            }
            
            // 移除点击事件
            message.removeEventListener('click', toggleMessageSelection);
        });
    }
    
    // 切换消息选择状态
    function toggleMessageSelection(event) {
        if (!isSelectMode) return;
        
        // 阻止事件冒泡
        event.stopPropagation();
        
        const messageElement = event.target.closest('.message');
        const checkbox = messageElement.querySelector('.message-checkbox');
        
        // 如果点击的是复选框，直接使用复选框的状态
        if (event.target === checkbox) {
            messageElement.classList.toggle('selected', checkbox.checked);
            
            if (checkbox.checked) {
                selectedMessages.push(messageElement.dataset.id);
            } else {
                selectedMessages = selectedMessages.filter(id => id !== messageElement.dataset.id);
            }
        } else {
            // 否则，切换状态
            const isSelected = messageElement.classList.toggle('selected');
            checkbox.checked = isSelected;
            
            if (isSelected) {
                selectedMessages.push(messageElement.dataset.id);
            } else {
                selectedMessages = selectedMessages.filter(id => id !== messageElement.dataset.id);
            }
        }
        
        updateSelectedCount();
    }
    
    // 更新已选择消息数量显示
    function updateSelectedCount() {
        selectedCountText.textContent = `已选择 ${selectedMessages.length} 条消息`;
    }
    
    // 删除选中的消息
    function deleteSelectedMessages() {
        if (selectedMessages.length === 0) {
            alert('请至少选择一条消息');
            return;
        }
        
        // 从DOM中删除
        selectedMessages.forEach(messageId => {
            const messageElement = chatMessages.querySelector(`.message[data-id="${messageId}"]`);
            if (messageElement) {
                messageElement.remove();
            }
        });
        
        // 从存储中删除
        if (currentConversationId) {
            const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
            if (conversationIndex !== -1) {
                conversations[conversationIndex].messages = conversations[conversationIndex].messages.filter(
                    message => !selectedMessages.includes(message.id)
                );
                saveConversations();
            }
        }
        
        // 退出选择模式
        exitSelectMode();
    }
    
    // 确认清空所有消息
    function confirmClearAllMessages() {
        if (!currentConversationId) {
            alert('请先选择一个对话');
            return;
        }
        
        messageActionsDropdown.classList.remove('show');
        deleteMode = 'messages';
        confirmDeleteMessage.textContent = '确定要清空所有消息吗？此操作不可恢复。';
        confirmDeleteModal.style.display = 'flex';
    }
    
    // 确认删除联系人
    function confirmDeleteConversation() {
        if (!currentConversationId) {
            alert('请先选择一个对话');
            return;
        }
        
        deleteMode = 'conversation';
        confirmDeleteMessage.textContent = '确定要删除此联系人吗？此操作将删除所有相关信息，且不可恢复。';
        confirmDeleteModal.style.display = 'flex';
    }
    
    // 关闭确认删除模态框
    function closeConfirmDeleteModal() {
        confirmDeleteModal.style.display = 'none';
        deleteMode = '';
    }
    
    // 执行删除操作
    function executeDelete() {
        if (deleteMode === 'messages') {
            // 清空所有消息
            clearAllMessages();
        } else if (deleteMode === 'conversation') {
            // 删除联系人
            deleteConversation();
        }
        
        closeConfirmDeleteModal();
    }
    
    // 清空所有消息
    function clearAllMessages() {
        if (!currentConversationId) return;
        
        // 清空聊天区域
        chatMessages.innerHTML = '';
        
        // 清空存储中的消息
        const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
        if (conversationIndex !== -1) {
            conversations[conversationIndex].messages = [];
            saveConversations();
        }
        
        // 添加欢迎消息
        const conversation = conversations[conversationIndex];
        addMessage(`你好！这是与 ${conversation.name} 的新对话。`, 'received');
    }
    
    // 删除联系人
    function deleteConversation() {
        if (!currentConversationId) return;
        
        // 从存储中删除
        conversations = conversations.filter(c => c.id !== currentConversationId);
        saveConversations();
        
        // 隐藏详情面板
        hideConversationDetails();
        
        // 重新渲染对话列表
        renderConversationsList();
        
        // 如果还有其他对话，切换到第一个
        if (conversations.length > 0) {
            switchConversation(conversations[0].id);
        } else {
            // 否则，重置当前对话ID和聊天区域
            currentConversationId = null;
            chatMessages.innerHTML = '';
            currentAvatar.src = 'default-avatar.png';
            currentName.textContent = '未选择对话';
            
            // 添加欢迎消息
            addMessage('你好！我是你的聊天助手。请创建一个新的对话开始聊天。', 'received');
        }
    }
});

/**
 * 在实际应用中，你可以添加一个函数来连接到后端API
 * 例如：
 * 
 * async function getResponseFromAPI(message, settings) {
 *     try {
 *         const response = await fetch('https://your-api-endpoint.com/chat', {
 *             method: 'POST',
 *             headers: {
 *                 'Content-Type': 'application/json',
 *             },
 *             body: JSON.stringify({
 *                 message: message,
 *                 settings: settings
 *             }),
 *         });
 *         
 *         if (!response.ok) {
 *             throw new Error('API请求失败');
 *         }
 *         
 *         const data = await response.json();
 *         return data.reply;
 *     } catch (error) {
 *         console.error('获取回复时出错:', error);
 *         return '抱歉，获取回复时出现了问题。请稍后再试。';
 *     }
 * }
 */ 
