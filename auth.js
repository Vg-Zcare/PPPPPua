/**
 * auth.js
 * 负责用户认证、登录状态检查等功能
 */

// 用户认证模块
const Auth = (function() {
    // 登录检查状态标志，防止重复检查
    let loginChecked = false;
    
    // 当前登录用户信息
    let currentUser = null;

    /**
     * 检查用户是否已登录
     * @returns {Object|null} 返回当前用户信息或null（如果未登录）
     */
    function checkUserLogin() {
        // 如果已经检查过登录状态，不再重复检查
        if (loginChecked) {
            return currentUser;
        }
        
        // 标记为已经检查过
        loginChecked = true;
        
        try {
            const savedUser = localStorage.getItem('chatAppCurrentUser');
            console.log('检查用户登录状态:', savedUser);
            
            if (!savedUser) {
                console.log('用户未登录，跳转到登录页面');
                // 使用延时确保localStorage有足够时间同步
                setTimeout(function() {
                    window.location.replace('login.html');
                }, 100);
                return null;
            }
            
            currentUser = JSON.parse(savedUser);
            console.log('用户已登录:', currentUser);
            
            // 显示用户信息
            const userNickname = document.getElementById('user-nickname');
            if (userNickname) {
                userNickname.textContent = currentUser.nickname || currentUser.username;
                console.log('设置用户昵称为:', userNickname.textContent);
            }
            
            return currentUser;
            
        } catch (error) {
            console.error('获取用户信息失败:', error);
            // 使用延时确保localStorage有足够时间同步
            setTimeout(function() {
                window.location.replace('login.html');
            }, 100);
            return null;
        }
    }

    /**
     * 退出登录
     */
    function logout() {
        localStorage.removeItem('chatAppCurrentUser');
        window.location.replace('login.html');
    }

    /**
     * 获取当前用户信息
     * @returns {Object|null} 当前用户信息或null
     */
    function getCurrentUser() {
        return currentUser;
    }

    // 公开API
    return {
        checkUserLogin,
        logout,
        getCurrentUser
    };
})();

// 导出模块
window.Auth = Auth; 