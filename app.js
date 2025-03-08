/**
 * app.js
 * 应用程序主入口，负责初始化和组装所有模块
 */

// 主应用模块
const App = (function() {
    // 当前删除操作的模式
    let deleteMode = ''; // 'messages' 或 'conversation'
    let deleteCallback = null;
    
    /**
     * 初始化应用程序
     */
    function init() {
        console.log('正在初始化聊天应用...');
        
        // 1. 检查用户登录状态
        const currentUser = window.Auth.checkUserLogin();
        if (!currentUser) {
            console.log('用户未登录，跳转到登录页面');
            return; // 如果未登录，Auth模块会自动重定向，这里直接返回
        }
        
        console.log(`欢迎回来，${currentUser.nickname || currentUser.username}!`);
        
        // 2. 初始化UI元素引用并绑定事件
        initUIElements();
        
        // 3. 初始化对话模块
        window.Conversation.init(currentUser.username);
        
        // 4. 初始化消息模块
        window.Message.init();
        
        // 5. 设置初始UI布局
        const sidebarElement = document.getElementById('conversations-sidebar');
        window.UI.setInitialLayout(sidebarElement);
        
        console.log('聊天应用初始化完成');
    }
    
    /**
     * 初始化UI元素引用并绑定事件
     */
    function initUIElements() {
        // 获取DOM元素 - 聊天功能
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const applySettingsButton = document.getElementById('apply-settings');
        
        // 获取DOM元素 - 对话管理
        const conversationsSidebar = document.getElementById('conversations-sidebar');
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
        
        // 获取DOM元素 - 消息操作
        const messageActionsBtn = document.getElementById('message-actions-btn');
        const messageActionsDropdown = document.getElementById('message-actions-dropdown');
        const selectMessagesBtn = document.getElementById('select-messages-btn');
        const clearAllMessagesBtn = document.getElementById('clear-all-messages-btn');
        const deleteSelectedBtn = document.getElementById('delete-selected-btn');
        const cancelSelectionBtn = document.getElementById('cancel-selection-btn');
        
        // 获取DOM元素 - 确认删除模态框
        const confirmDeleteModal = document.getElementById('confirm-delete-modal');
        const closeConfirmModal = document.getElementById('close-confirm-modal');
        const confirmDeleteMessage = document.getElementById('confirm-delete-message');
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        
        // 添加事件监听器 - 聊天功能
        sendButton.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keydown', function(e) {
            // 按下回车键发送消息（不按Shift）
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // 阻止默认的换行行为
                handleSendMessage();
            }
        });
        
        applySettingsButton.addEventListener('click', handleUpdateSettings);
        
        // 添加事件监听器 - 对话管理
        sidebarToggle.addEventListener('click', function() {
            window.UI.toggleSidebar(conversationsSidebar);
        });
        newConversationBtn.addEventListener('click', function() {
            window.UI.openModal(newConversationModal);
            if (newConversationName) newConversationName.focus();
            if (newAvatarPreview) newAvatarPreview.src = window.Utils.getRandomDefaultAvatar();
        });
        closeNewConversationModal.addEventListener('click', function() {
            window.UI.closeModal(newConversationModal);
        });
        cancelCreateBtn.addEventListener('click', function() {
            window.UI.closeModal(newConversationModal);
        });
        createConversationBtn.addEventListener('click', handleCreateNewConversation);
        
        // 添加事件监听器 - 对话详情
        viewDetailsBtn.addEventListener('click', function() {
            handleShowConversationDetails(conversationDetails);
        });
        detailsBackButton.addEventListener('click', function() {
            window.UI.hidePanel(conversationDetails);
        });
        saveDetailsBtn.addEventListener('click', handleSaveConversationDetails);
        continueChatBtn.addEventListener('click', function() {
            window.UI.hidePanel(conversationDetails);
        });
        deleteConversationBtn.addEventListener('click', handleConfirmDeleteConversation);
        
        // 添加事件监听器 - 头像上传
        if (selectAvatarBtn && newAvatarUpload) {
            selectAvatarBtn.addEventListener('click', () => newAvatarUpload.click());
            newAvatarUpload.addEventListener('change', handleNewAvatarUpload);
        }
        if (changeAvatarBtn && avatarUpload) {
            changeAvatarBtn.addEventListener('click', () => avatarUpload.click());
            avatarUpload.addEventListener('change', handleAvatarUpload);
        }
        
        // 添加事件监听器 - 消息操作
        if (messageActionsBtn && messageActionsDropdown) {
            messageActionsBtn.addEventListener('click', function(event) {
                window.UI.toggleDropdown(messageActionsDropdown, event);
            });
        }
        document.addEventListener('click', function(event) {
            if (messageActionsBtn && messageActionsDropdown) {
                window.UI.closeDropdownOnClickOutside(messageActionsDropdown, messageActionsBtn, event);
            }
        });
        if (selectMessagesBtn) {
            selectMessagesBtn.addEventListener('click', function() {
                window.Message.enterSelectMode();
            });
        }
        if (clearAllMessagesBtn) {
            clearAllMessagesBtn.addEventListener('click', function() {
                window.Message.confirmClearAllMessages();
            });
        }
        if (cancelSelectionBtn) {
            cancelSelectionBtn.addEventListener('click', function() {
                window.Message.exitSelectMode();
            });
        }
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', function() {
                window.Message.deleteSelectedMessages();
            });
        }
        
        // 添加事件监听器 - 确认删除模态框
        if (closeConfirmModal) {
            closeConfirmModal.addEventListener('click', function() {
                window.UI.closeModal(confirmDeleteModal);
            });
        }
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', function() {
                window.UI.closeModal(confirmDeleteModal);
            });
        }
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', function() {
                executeDelete();
                window.UI.closeModal(confirmDeleteModal);
            });
        }
        
        // 移动端优化 - 窗口大小变化时调整布局
        window.addEventListener('resize', function() {
            const chatMessages = document.getElementById('chat-messages');
            window.UI.handleResize(conversationsSidebar, chatMessages);
        });
        
        // 移动端优化 - 修复iOS输入框问题
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && messageInput) {
            // 修复iOS键盘弹出后的滚动问题
            messageInput.addEventListener('focus', function() {
                setTimeout(function() {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    window.scrollTo(0, 0);
                }, 300);
            });
        }
    }
    
    /**
     * 处理发送消息
     */
    function handleSendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;
        
        const messageText = messageInput.value.trim();
        if (messageText === '') return;
        
        // 使用Message模块发送消息
        const messageSent = window.Message.sendMessage(messageText);
        
        if (messageSent) {
            // 发送成功后处理输入框
            window.Message.afterSendMessage(messageInput);
        }
    }
    
    /**
     * 处理更新设置
     */
    function handleUpdateSettings() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // 获取设置表单的值
        const sceneInput = document.getElementById('scene');
        const behaviorInput = document.getElementById('behavior');
        const partnerInfoInput = document.getElementById('partner-info');
        const customSettingInput = document.getElementById('custom-setting');
        
        const settings = {
            scene: sceneInput ? sceneInput.value.trim() : '',
            behavior: behaviorInput ? behaviorInput.value.trim() : '',
            partnerInfo: partnerInfoInput ? partnerInfoInput.value.trim() : '',
            customSetting: customSettingInput ? customSettingInput.value.trim() : ''
        };
        
        // 使用Conversation模块更新设置
        const success = window.Conversation.updateSettings(settings, currentUser.username);
        
        if (success) {
            window.UI.showNotification('设置已更新', 'success');
        } else {
            window.UI.showNotification('更新设置失败', 'error');
        }
    }
    
    /**
     * 处理创建新对话
     */
    function handleCreateNewConversation() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        const newConversationName = document.getElementById('new-conversation-name');
        const newAvatarPreview = document.getElementById('new-avatar-preview');
        const newConversationNote = document.getElementById('new-conversation-note');
        const newConversationModal = document.getElementById('new-conversation-modal');
        
        if (!newConversationName || !newAvatarPreview) return;
        
        const name = newConversationName.value.trim();
        if (!name) {
            window.UI.showNotification('请输入对话名称', 'error');
            return;
        }
        
        // 构建新对话数据
        const conversationData = {
            name: name,
            avatar: newAvatarPreview.src,
            note: newConversationNote ? newConversationNote.value.trim() : ''
        };
        
        // 使用Conversation模块创建新对话
        const newId = window.Conversation.createNewConversation(conversationData, currentUser.username);
        
        if (newId) {
            // 关闭模态框
            window.UI.closeModal(newConversationModal);
            window.UI.showNotification('创建对话成功', 'success');
        } else {
            window.UI.showNotification('创建对话失败', 'error');
        }
    }
    
    /**
     * 处理显示对话详情
     * @param {HTMLElement} detailsPanel 详情面板元素
     */
    function handleShowConversationDetails(detailsPanel) {
        const currentConversationId = window.Conversation.getCurrentConversationId();
        if (!currentConversationId) {
            window.UI.showNotification('请先选择一个对话', 'info');
            return;
        }
        
        const currentConversation = window.Conversation.getCurrentConversation();
        if (!currentConversation) return;
        
        // 填充详情
        const detailsAvatar = document.getElementById('details-avatar');
        const detailsName = document.getElementById('details-name');
        const detailsNote = document.getElementById('details-note');
        
        if (detailsAvatar) detailsAvatar.src = currentConversation.avatar;
        if (detailsName) detailsName.value = currentConversation.name;
        if (detailsNote) detailsNote.value = currentConversation.note || '';
        
        // 显示面板
        window.UI.showPanel(detailsPanel);
    }
    
    /**
     * 处理保存对话详情
     */
    function handleSaveConversationDetails() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        const detailsAvatar = document.getElementById('details-avatar');
        const detailsName = document.getElementById('details-name');
        const detailsNote = document.getElementById('details-note');
        const conversationDetails = document.getElementById('conversation-details');
        
        if (!detailsName || !detailsAvatar) return;
        
        const name = detailsName.value.trim();
        if (!name) {
            window.UI.showNotification('对话名称不能为空', 'error');
            return;
        }
        
        // 构建对话详情数据
        const details = {
            name: name,
            avatar: detailsAvatar.src,
            note: detailsNote ? detailsNote.value : ''
        };
        
        // 使用Conversation模块保存详情
        const success = window.Conversation.saveConversationDetails(details, currentUser.username);
        
        if (success) {
            window.UI.hidePanel(conversationDetails);
            window.UI.showNotification('保存成功', 'success');
        } else {
            window.UI.showNotification('保存失败', 'error');
        }
    }
    
    /**
     * 处理确认删除对话
     */
    function handleConfirmDeleteConversation() {
        // 显示确认对话框
        showConfirmDialog('确定要删除此联系人吗？此操作将删除所有相关信息，且不可恢复。', 'conversation', handleDeleteConversation);
    }
    
    /**
     * 处理删除对话
     */
    function handleDeleteConversation() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // 使用Conversation模块删除当前对话
        const success = window.Conversation.deleteConversation(currentUser.username);
        
        if (success) {
            const conversationDetails = document.getElementById('conversation-details');
            window.UI.hidePanel(conversationDetails);
            window.UI.showNotification('删除成功', 'success');
        } else {
            window.UI.showNotification('删除失败', 'error');
        }
    }
    
    /**
     * 处理新对话头像上传
     * @param {Event} event 文件选择事件
     */
    function handleNewAvatarUpload(event) {
        const newAvatarPreview = document.getElementById('new-avatar-preview');
        if (!newAvatarPreview) return;
        
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newAvatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * 处理对话详情头像上传
     * @param {Event} event 文件选择事件
     */
    function handleAvatarUpload(event) {
        const detailsAvatar = document.getElementById('details-avatar');
        if (!detailsAvatar) return;
        
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                detailsAvatar.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * 显示确认对话框
     * @param {String} message 确认消息
     * @param {String} mode 删除模式 ('messages' 或 'conversation')
     * @param {Function} callback 确认后的回调函数
     */
    function showConfirmDialog(message, mode, callback) {
        const confirmDeleteModal = document.getElementById('confirm-delete-modal');
        const confirmDeleteMessage = document.getElementById('confirm-delete-message');
        
        if (!confirmDeleteModal || !confirmDeleteMessage) {
            // 如果没有确认对话框元素，直接调用confirm
            if (confirm(message)) {
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
            return;
        }
        
        // 设置确认对话框内容
        confirmDeleteMessage.textContent = message;
        deleteMode = mode;
        deleteCallback = callback;
        
        // 显示确认对话框
        window.UI.openModal(confirmDeleteModal);
    }
    
    /**
     * 执行删除操作
     */
    function executeDelete() {
        if (deleteCallback && typeof deleteCallback === 'function') {
            deleteCallback();
        }
        
        // 重置状态
        deleteMode = '';
        deleteCallback = null;
    }

    // 公开API
    return {
        init,
        showConfirmDialog,
        executeDelete
    };
})();

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    window.App = App;
    App.init();
}); 