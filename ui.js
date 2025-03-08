/**
 * ui.js
 * 处理界面布局和交互控制
 */

// UI模块
const UI = (function() {
    // 是否为移动设备
    const isMobile = window.innerWidth <= 768;

    /**
     * 设置初始布局
     * @param {HTMLElement} sidebarElement 侧边栏元素
     */
    function setInitialLayout(sidebarElement) {
        if (!sidebarElement) return;
        
        if (window.innerWidth <= 768) {
            // 移动设备默认收起侧边栏
            sidebarElement.classList.remove('expanded');
        } else {
            // 桌面设备默认展开侧边栏
            sidebarElement.classList.add('expanded');
        }
    }
    
    /**
     * 处理窗口大小变化
     * @param {HTMLElement} sidebarElement 侧边栏元素
     * @param {HTMLElement} messagesElement 消息区域元素
     */
    function handleResize(sidebarElement, messagesElement) {
        // 更新移动设备状态
        const wasMobile = isMobile;
        const nowMobile = window.innerWidth <= 768;
        
        // 如果设备类型改变（从桌面变为移动或从移动变为桌面）
        if (wasMobile !== nowMobile && sidebarElement) {
            // 调整布局
            setInitialLayout(sidebarElement);
            
            // 重新计算聊天区域高度
            if (messagesElement) {
                adjustChatAreaHeight(messagesElement);
            }
        }
    }
    
    /**
     * 调整聊天区域高度
     * @param {HTMLElement} messagesElement 消息区域元素
     */
    function adjustChatAreaHeight(messagesElement) {
        if (!messagesElement) return;
        
        // 在消息发送后或加载聊天记录后滚动到底部
        messagesElement.scrollTop = messagesElement.scrollHeight;
    }
    
    /**
     * 切换侧边栏展开/收起
     * @param {HTMLElement} sidebarElement 侧边栏元素
     */
    function toggleSidebar(sidebarElement) {
        if (!sidebarElement) return;
        
        sidebarElement.classList.toggle('expanded');
        
        // 在移动端，侧边栏展开时滚动到顶部
        if (window.innerWidth <= 768 && sidebarElement.classList.contains('expanded')) {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        }
    }
    
    /**
     * 打开模态框
     * @param {HTMLElement} modalElement 模态框元素
     */
    function openModal(modalElement) {
        if (!modalElement) return;
        modalElement.style.display = 'flex';
    }
    
    /**
     * 关闭模态框
     * @param {HTMLElement} modalElement 模态框元素
     */
    function closeModal(modalElement) {
        if (!modalElement) return;
        modalElement.style.display = 'none';
    }
    
    /**
     * 显示对话详情面板
     * @param {HTMLElement} detailsPanel 详情面板元素
     */
    function showPanel(detailsPanel) {
        if (!detailsPanel) return;
        detailsPanel.style.display = 'block';
    }
    
    /**
     * 隐藏对话详情面板
     * @param {HTMLElement} detailsPanel 详情面板元素
     */
    function hidePanel(detailsPanel) {
        if (!detailsPanel) return;
        detailsPanel.style.display = 'none';
    }
    
    /**
     * 切换下拉菜单显示状态
     * @param {HTMLElement} dropdown 下拉菜单元素
     * @param {Event} event 事件对象
     */
    function toggleDropdown(dropdown, event) {
        if (!dropdown) return;
        
        event.stopPropagation(); // 阻止事件冒泡
        dropdown.classList.toggle('show');
    }
    
    /**
     * 点击外部区域时关闭下拉菜单
     * @param {HTMLElement} dropdown 下拉菜单元素 
     * @param {HTMLElement} toggleButton 触发按钮
     * @param {Event} event 事件对象
     */
    function closeDropdownOnClickOutside(dropdown, toggleButton, event) {
        if (!dropdown || !toggleButton) return;
        
        if (!toggleButton.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    }

    /**
     * 显示通知消息
     * @param {String} message 消息内容
     * @param {String} type 消息类型 (success, error, info)
     * @param {Number} duration 显示持续时间（毫秒）
     */
    function showNotification(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加到文档
        document.body.appendChild(notification);
        
        // 显示效果
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动关闭
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }

    // 公开API
    return {
        setInitialLayout,
        handleResize,
        adjustChatAreaHeight,
        toggleSidebar,
        openModal,
        closeModal,
        showPanel,
        hidePanel,
        toggleDropdown,
        closeDropdownOnClickOutside,
        showNotification,
        isMobile
    };
})();

// 导出模块
window.UI = UI; 