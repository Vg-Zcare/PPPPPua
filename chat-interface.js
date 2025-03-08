document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录
    checkUserLogin();
    
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
    
    // 当前登录用户信息
    let currentUser = null;
    
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
    
    // 判断是否为移动设备
    const isMobile = window.innerWidth <= 768;
    
    // 默认头像 - 使用本地资源而非CDN链接
    const defaultAvatars = [
        'default-avatar.svg'
    ];
    
    // 初始化
    init();
    
    // 检查用户是否已登录
    function checkUserLogin() {
        try {
            const savedUser = localStorage.getItem('chatAppCurrentUser');
            if (!savedUser) {
                // 未登录，跳转到登录页
                window.location.href = 'login.html';
                return;
            }
            
            currentUser = JSON.parse(savedUser);
            
            // 显示用户信息
            const userNickname = document.getElementById('user-nickname');
            if (userNickname) {
                userNickname.textContent = currentUser.nickname || currentUser.username;
            }
            
        } catch (error) {
            console.error('获取用户信息失败:', error);
            window.location.href = 'login.html';
        }
    }
    
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
        
        // 添加事件监听器 - 对话详情
        viewDetailsBtn.addEventListener('click', showConversationDetails);
        detailsBackButton.addEventListener('click', hideConversationDetails);
        saveDetailsBtn.addEventListener('click', saveConversationDetails);
        continueChatBtn.addEventListener('click', hideConversationDetails);
        deleteConversationBtn.addEventListener('click', confirmDeleteConversation);
        
        // 添加事件监听器 - 头像上传
        selectAvatarBtn.addEventListener('click', () => newAvatarUpload.click());
        newAvatarUpload.addEventListener('change', handleNewAvatarUpload);
        changeAvatarBtn.addEventListener('click', () => avatarUpload.click());
        avatarUpload.addEventListener('change', handleAvatarUpload);
        
        // 添加事件监听器 - 消息操作
        messageActionsBtn.addEventListener('click', toggleMessageActionsDropdown);
        document.addEventListener('click', closeDropdownOnClickOutside);
        selectMessagesBtn.addEventListener('click', enterSelectMode);
        clearAllMessagesBtn.addEventListener('click', confirmClearAllMessages);
        cancelSelectionBtn.addEventListener('click', exitSelectMode);
        deleteSelectedBtn.addEventListener('click', deleteSelectedMessages);
        
        // 添加事件监听器 - 确认删除模态框
        closeConfirmModal.addEventListener('click', closeConfirmDeleteModal);
        cancelDeleteBtn.addEventListener('click', closeConfirmDeleteModal);
        confirmDeleteBtn.addEventListener('click', executeDelete);
        
        // 移动端优化 - 修复iOS输入框问题
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            // 修复iOS键盘弹出后的滚动问题
            messageInput.addEventListener('focus', function() {
                setTimeout(function() {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    window.scrollTo(0, 0);
                }, 300);
            });
        }
        
        // 移动端优化 - 空白处点击关闭下拉菜单
        document.addEventListener('click', function(event) {
            if (messageActionsDropdown.classList.contains('show') && 
                !messageActionsBtn.contains(event.target) && 
                !messageActionsDropdown.contains(event.target)) {
                messageActionsDropdown.classList.remove('show');
            }
        });
        
        // 移动端优化 - 窗口大小变化时调整布局
        window.addEventListener('resize', handleResize);
        
        // 初始根据设备设置合适的初始布局
        setInitialLayout();
        
        // 从本地存储加载对话
        loadConversations();
    }
    
    // 设置初始布局
    function setInitialLayout() {
        if (window.innerWidth <= 768) {
            // 移动设备默认收起侧边栏
            conversationsSidebar.classList.remove('expanded');
        } else {
            // 桌面设备默认展开侧边栏
            conversationsSidebar.classList.add('expanded');
        }
    }
    
    // 处理窗口大小变化
    function handleResize() {
        // 更新移动设备状态
        const wasMobile = isMobile;
        const nowMobile = window.innerWidth <= 768;
        
        // 如果设备类型改变（从桌面变为移动或从移动变为桌面）
        if (wasMobile !== nowMobile) {
            // 调整布局
            setInitialLayout();
            
            // 重新计算聊天区域高度
            adjustChatAreaHeight();
        }
    }
    
    // 调整聊天区域高度
    function adjustChatAreaHeight() {
        // 在消息发送后或加载聊天记录后滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 更新聊天设置
    function updateSettings() {
        const sceneInput = document.getElementById('scene');
        const behaviorInput = document.getElementById('behavior');
        const partnerInfoInput = document.getElementById('partner-info');
        const customSettingInput = document.getElementById('custom-setting');
        
        chatSettings.scene = sceneInput.value.trim();
        chatSettings.behavior = behaviorInput.value.trim();
        chatSettings.partnerInfo = partnerInfoInput.value.trim();
        chatSettings.customSetting = customSettingInput.value.trim();
        
        // 保存设置到当前对话
        if (currentConversationId) {
            const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
            if (conversationIndex !== -1) {
                conversations[conversationIndex].settings = {...chatSettings};
                saveConversations();
                alert('设置已保存');
            }
        }
    }
    
    // 发送消息
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;
        
        if (currentConversationId) {
            // 找到当前对话
            const currentConversation = conversations.find(c => c.id === currentConversationId);
            if (currentConversation) {
                // 创建消息对象
                const messageId = generateId();
                const message = {
                    id: messageId,
                    text: messageText,
                    sender: 'user',
                    timestamp: new Date().toISOString()
                };
                
                // 添加到对话消息数组
                currentConversation.messages.push(message);
                
                // 更新存储
                saveConversations();
                
                // 渲染消息
                renderMessage(message);
                
                // 模拟回复
                simulateReply(currentConversation);
                
                // 调用发送后处理函数
                afterSendMessage();
            }
        } else {
            alert('请先选择或创建一个对话');
        }
    }
    
    // 渲染单条消息
    function renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.dataset.id = message.id;
        
        const isUserMessage = message.sender === 'user';
        messageElement.classList.add(isUserMessage ? 'message-sent' : 'message-received');
        
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        messageBubble.textContent = message.text;
        
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
        
        chatMessages.appendChild(messageElement);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 如果在选择模式，添加可选择类
        if (isSelectMode) {
            messageElement.classList.add('selectable');
            messageElement.addEventListener('click', toggleMessageSelection);
        }
    }
    
    // 获取当前时间
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // 模拟回复（在实际应用中，这会被API调用替代）
    function simulateReply(conversation) {
        // 这里是一个简单的回复逻辑，实际应用中会更复杂
        let reply = '';
        
        if (Object.values(chatSettings).some(setting => setting !== '')) {
            reply = '根据设置生成的回复:\n';
            if (chatSettings.scene) reply += `场景：${chatSettings.scene}\n`;
            if (chatSettings.behavior) reply += `行为：${chatSettings.behavior}\n`;
            if (chatSettings.partnerInfo) reply += `对方信息：${chatSettings.partnerInfo}\n`;
            if (chatSettings.customSetting) reply += `自定义设置：${chatSettings.customSetting}\n`;
            reply += `\n针对"${conversation.messages[conversation.messages.length - 1].text}"的回复是：这是一个模拟回复，在实际应用中，这里会根据设置和用户输入生成更智能的回复。`;
        } else {
            reply = `你说："${conversation.messages[conversation.messages.length - 1].text}"。这是一个模拟回复，在实际应用中，这里会连接到后端API获取真实回复。`;
        }
        
        // 延迟一下，模拟网络请求
        setTimeout(() => {
            // 创建回复消息
            const replyId = generateId();
            const replyMessage = {
                id: replyId,
                text: reply,
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            
            // 添加到当前对话
            const currentConversation = conversations.find(c => c.id === currentConversationId);
            if (currentConversation) {
                currentConversation.messages.push(replyMessage);
                saveConversations();
                renderMessage(replyMessage);
            }
        }, 1000);
    }
    
    // 切换侧边栏
    function toggleSidebar() {
        conversationsSidebar.classList.toggle('expanded');
        
        // 在移动端，侧边栏展开时滚动到顶部
        if (window.innerWidth <= 768 && conversationsSidebar.classList.contains('expanded')) {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        }
    }
    
    // 打开新建对话模态框
    function openNewConversationModal() {
        newConversationModal.style.display = 'flex';
        newConversationName.value = '';
        newConversationNote.value = '';
        newAvatarPreview.src = getRandomDefaultAvatar();
        newConversationName.focus();
    }
    
    // 关闭模态框
    function closeModal() {
        newConversationModal.style.display = 'none';
        confirmDeleteModal.style.display = 'none';
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
            createdAt: new Date().toISOString(),
            lastMessage: null
        };
        
        conversations.push(newConversation);
        saveConversations();
        
        renderConversationsList();
        switchConversation(newConversation.id);
        
        closeModal();
    }
    
    // 处理新对话头像上传
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
    
    // 处理对话详情头像上传
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
    
    // 显示对话详情面板
    function showConversationDetails() {
        if (!currentConversationId) {
            alert('请先选择一个对话');
            return;
        }
        
        const currentConversation = conversations.find(c => c.id === currentConversationId);
        if (currentConversation) {
            detailsAvatar.src = currentConversation.avatar;
            detailsName.value = currentConversation.name;
            detailsNote.value = currentConversation.note || '';
            
            conversationDetails.style.display = 'block';
        }
    }
    
    // 隐藏对话详情面板
    function hideConversationDetails() {
        conversationDetails.style.display = 'none';
    }
    
    // 保存对话详情
    function saveConversationDetails() {
        if (!currentConversationId) return;
        
        const name = detailsName.value.trim();
        if (!name) {
            alert('对话名称不能为空');
            return;
        }
        
        const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
        if (conversationIndex !== -1) {
            conversations[conversationIndex].name = name;
            conversations[conversationIndex].avatar = detailsAvatar.src;
            conversations[conversationIndex].note = detailsNote.value.trim();
            
            saveConversations();
            renderConversationsList();
            
            // 更新当前对话信息
            updateCurrentConversationInfo(conversations[conversationIndex]);
            
            hideConversationDetails();
        }
    }
    
    // 切换对话
    function switchConversation(conversationId) {
        currentConversationId = conversationId;
        
        // 清空聊天区域
        chatMessages.innerHTML = '';
        
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
            loadConversationMessages(currentConversation);
        }
        
        // 在移动设备上，切换对话后收起侧边栏
        if (window.innerWidth <= 768) {
            conversationsSidebar.classList.remove('expanded');
        }
    }
    
    // 更新当前对话信息显示
    function updateCurrentConversationInfo(conversation) {
        currentAvatar.src = conversation.avatar;
        currentName.textContent = conversation.name;
    }
    
    // 加载对话设置
    function loadConversationSettings(conversation) {
        if (conversation.settings) {
            chatSettings = {...conversation.settings};
            
            // 更新设置表单
            document.getElementById('scene').value = chatSettings.scene || '';
            document.getElementById('behavior').value = chatSettings.behavior || '';
            document.getElementById('partner-info').value = chatSettings.partnerInfo || '';
            document.getElementById('custom-setting').value = chatSettings.customSetting || '';
        }
    }
    
    // 加载对话消息
    function loadConversationMessages(conversation) {
        if (conversation.messages && conversation.messages.length > 0) {
            // 先清空现有消息
            chatMessages.innerHTML = '';
            
            // 重新渲染所有消息
            conversation.messages.forEach(message => {
                renderMessage(message);
            });
            
            // 滚动到底部
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // 渲染对话列表
    function renderConversationsList() {
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
                switchConversation(conversation.id);
            });
            
            conversationsList.appendChild(conversationItem);
        });
    }
    
    // 保存对话到本地存储
    function saveConversations() {
        try {
            // 获取基于当前URL路径和用户名的存储键名
            const storageKey = getStorageKey(`chatConversations_${currentUser.username}`);
            localStorage.setItem(storageKey, JSON.stringify(conversations));
        } catch (error) {
            console.error('保存对话失败:', error);
            // 可以在这里添加错误处理逻辑，如显示错误通知
        }
    }
    
    // 从本地存储加载对话
    function loadConversations() {
        try {
            // 获取基于当前URL路径和用户名的存储键名
            const storageKey = getStorageKey(`chatConversations_${currentUser.username}`);
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
    
    // 点击外部关闭下拉菜单
    function closeDropdownOnClickOutside(event) {
        if (!messageActionsBtn.contains(event.target) && !messageActionsDropdown.contains(event.target)) {
            messageActionsDropdown.classList.remove('show');
        }
    }
    
    // 进入消息选择模式
    function enterSelectMode() {
        isSelectMode = true;
        selectedMessages = [];
        
        // 隐藏下拉菜单
        messageActionsDropdown.classList.remove('show');
        
        // 显示工具栏
        messageSelectionToolbar.classList.add('show');
        
        // 更新选中消息计数
        updateSelectedCount();
        
        // 让所有消息可选择
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            message.classList.add('selectable');
            message.addEventListener('click', toggleMessageSelection);
        });
    }
    
    // 退出消息选择模式
    function exitSelectMode() {
        isSelectMode = false;
        selectedMessages = [];
        
        // 隐藏工具栏
        messageSelectionToolbar.classList.remove('show');
        
        // 移除所有消息的可选择状态
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            message.classList.remove('selectable', 'selected');
            message.removeEventListener('click', toggleMessageSelection);
        });
    }
    
    // 切换消息选择状态
    function toggleMessageSelection(event) {
        const messageElement = event.currentTarget;
        const messageId = messageElement.dataset.id;
        
        if (!messageId) return;
        
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
    
    // 更新选中消息计数
    function updateSelectedCount() {
        selectedCountText.textContent = `已选择 ${selectedMessages.length} 条消息`;
    }
    
    // 删除选中的消息
    function deleteSelectedMessages() {
        if (selectedMessages.length === 0) {
            alert('请至少选择一条消息');
            return;
        }
        
        // 找到当前对话
        const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
        if (conversationIndex === -1) return;
        
        // 移除选中的消息
        conversations[conversationIndex].messages = conversations[conversationIndex].messages.filter(
            message => !selectedMessages.includes(message.id)
        );
        
        // 保存更改
        saveConversations();
        
        // 重新加载消息
        loadConversationMessages(conversations[conversationIndex]);
        
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
        
        // 设置确认对话框内容
        confirmDeleteMessage.textContent = '确定要清空所有消息吗？此操作不可恢复。';
        deleteMode = 'messages';
        
        // 显示确认对话框
        confirmDeleteModal.style.display = 'flex';
    }
    
    // 确认删除对话
    function confirmDeleteConversation() {
        // 设置确认对话框内容
        confirmDeleteMessage.textContent = '确定要删除此联系人吗？此操作将删除所有相关信息，且不可恢复。';
        deleteMode = 'conversation';
        
        // 显示确认对话框
        confirmDeleteModal.style.display = 'flex';
    }
    
    // 关闭确认删除模态框
    function closeConfirmDeleteModal() {
        confirmDeleteModal.style.display = 'none';
    }
    
    // 执行删除操作
    function executeDelete() {
        if (deleteMode === 'messages') {
            // 清空所有消息
            clearAllMessages();
        } else if (deleteMode === 'conversation') {
            // 删除整个对话
            deleteConversation();
        }
        
        closeConfirmDeleteModal();
    }
    
    // 清空所有消息
    function clearAllMessages() {
        if (!currentConversationId) return;
        
        const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
        if (conversationIndex !== -1) {
            // 清空消息数组
            conversations[conversationIndex].messages = [];
            
            // 保存更改
            saveConversations();
            
            // 清空聊天区域
            chatMessages.innerHTML = '';
        }
    }
    
    // 删除当前对话
    function deleteConversation() {
        if (!currentConversationId) return;
        
        // 找到当前对话的索引
        const conversationIndex = conversations.findIndex(c => c.id === currentConversationId);
        if (conversationIndex === -1) return;
        
        // 从数组中移除当前对话
        conversations.splice(conversationIndex, 1);
        
        // 保存更改
        saveConversations();
        
        // 隐藏对话详情面板
        hideConversationDetails();
        
        // 重新渲染对话列表
        renderConversationsList();
        
        // 如果还有其他对话，切换到第一个对话
        if (conversations.length > 0) {
            switchConversation(conversations[0].id);
        } else {
            // 没有对话了，清空聊天区域和当前对话ID
            chatMessages.innerHTML = '';
            currentConversationId = null;
            currentAvatar.src = getRandomDefaultAvatar();
            currentName.textContent = '未选择对话';
        }
    }
    
    // 发送消息后的处理
    function afterSendMessage() {
        // 清空输入框
        messageInput.value = '';
        
        // 移动端自动收起键盘并滚动到底部
        if (window.innerWidth <= 768) {
            messageInput.blur();
            
            // 滚动到底部
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    }
}); 