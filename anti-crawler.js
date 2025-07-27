// 增强版反爬虫机制

    // 1. 基础防护
    function initBasicProtection() {
        // 禁用右键菜单
        /*document.addEventListener('contextmenu', function(e) {
            if (!e.target.closest('.contact-card') && 
                !e.target.closest('.theme-toggle') && 
                !e.target.closest('.settings-toggle')) {
                e.preventDefault();
                showWarning('⚠禁止使用右键菜单');
            }
        });*/
		document.addEventListener('contextmenu', function(e) {
		e.preventDefault();
		showWarning('⚠禁止使用右键菜单');
		return false;
		}, { capture: true });

        // 禁用开发者工具快捷键
        document.addEventListener('keydown', function(e) {
            if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                (e.ctrlKey && e.keyCode === 85) // Ctrl+U
            ) {
                e.preventDefault();
                showWarning('⚠禁止使用开发者工具');
                return false;
            }
        });

        // 禁用复制，但允许特定区域
        document.addEventListener('copy', function(e) {
            if (!e.target.closest('.contact-card') && 
                !e.target.closest('.theme-toggle') && 
                !e.target.closest('.settings-toggle')) {
                e.preventDefault();
                showWarning('⚠禁止复制内容');
            }
        }, true);
    }

    // 2. 简化的反调试
    function preventDebug() {
        const threshold = 160;
        setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                document.body.innerHTML = '<h1 style="text-align:center;padding-top:50px;">警告⚠：请勿使用开发者工具查看网页源代码！</h1>';
            }
        }, 1000);
    }

    // 3. 警告提示
    function showWarning(message) {
        const existingWarning = document.querySelector('.warning-message');
        if (existingWarning) {
            existingWarning.remove();
        }

        const warning = document.createElement('div');
        warning.className = 'warning-message';
        warning.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #ff4444;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        warning.textContent = message;

        document.body.appendChild(warning);
        setTimeout(() => warning.remove(), 2000);
    }

    // 4. 初始化
    initBasicProtection();
    preventDebug();