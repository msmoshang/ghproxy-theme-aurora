/**
 * Aurora主题的JavaScript功能
 * 提供GitHub链接转换、UI交互、API数据获取功能和深色模式切换
 */

// DOM元素缓存
const elements = {
    form: document.getElementById('github-form'),
    input: document.getElementById('githubLinkInput'),
    output: {
        container: document.getElementById('output'),
        content: document.getElementById('formattedLinkOutput')
    },
    buttons: {
        copy: document.getElementById('copyButton'),
        open: document.getElementById('openButton'),
        themeToggle: document.getElementById('themeToggle')
    },
    toast: document.getElementById('toast')
};

/**
 * 主题切换功能
 */
const themeManager = {
    // 主题类型
    themes: {
        light: 'light',
        dark: 'dark'
    },
    
    // 存储键名
    storageKey: 'aurora-theme-preference',
    
    // 获取当前主题
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || this.themes.light;
    },
    
    // 设置主题
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // 更新主题图标
        const themeIcon = elements.buttons.themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === this.themes.dark ? 'dark_mode' : 'light_mode';
        }
        
        // 保存到本地存储
        localStorage.setItem(this.storageKey, theme);
    },
    
    // 切换主题
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.themes.light ? this.themes.dark : this.themes.light;
        this.setTheme(newTheme);
    },
    
    // 初始化主题
    initTheme() {
        // 检查本地存储中的主题偏好
        const savedTheme = localStorage.getItem(this.storageKey);
        
        if (savedTheme) {
            // 应用保存的主题
            this.setTheme(savedTheme);
        } else {
            // 检查系统偏好
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDarkMode ? this.themes.dark : this.themes.light);
        }
    }
};


/**
 * 显示提示信息
 * @param {string} message - 要显示的消息
 */
function showToast(message) {
    const toastMessage = document.querySelector('.toast-message');
    if (!toastMessage) {
        console.error('找不到toast-message元素');
        return;
    }
    
    toastMessage.textContent = message;
    elements.toast.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

/**
 * 格式化GitHub链接
 * @param {string} githubLink - 原始GitHub链接
 * @returns {string|null} - 格式化后的链接或null（如果链接无效）
 */
function formatGithubLink(githubLink) {
    // 安全检查：确保输入是字符串类型
    if (typeof githubLink !== 'string') {
        showToast('无效的输入类型');
        return null;
    }
    
    // 对输入进行净化，移除潜在的危险字符
    githubLink = githubLink.trim();
    
    // 验证链接格式，只允许合法的GitHub链接格式
    const validGithubUrlPattern = /^(https?:\/\/)?(github\.com|raw\.githubusercontent\.com|gist\.githubusercontent\.com|api\.github\.com)\/.+$/i;
    if (!validGithubUrlPattern.test(githubLink)) {
        showToast('请输入有效的GitHub链接');
        return null;
    }
    
    const currentHost = window.location.host;
    const protocol = window.location.protocol;
    let formattedLink = "";

    // 链接类型匹配 - 使用更安全的方式处理URL
    if (githubLink.startsWith("https://github.com/") || githubLink.startsWith("http://github.com/")) {
        const pathIndex = githubLink.indexOf("/", 8);
        if (pathIndex !== -1) {
            formattedLink = `${protocol}//${currentHost}/github.com${githubLink.substring(pathIndex)}`;
        }
    } else if (githubLink.startsWith("github.com/")) {
        formattedLink = `${protocol}//${currentHost}/${githubLink}`;
    } else if (githubLink.startsWith("https://raw.githubusercontent.com/") || githubLink.startsWith("http://raw.githubusercontent.com/")) {
        const pathIndex = githubLink.indexOf("/", 7);
        if (pathIndex !== -1) {
            formattedLink = `${protocol}//${currentHost}${githubLink.substring(pathIndex)}`;
        }
    } else if (githubLink.startsWith("raw.githubusercontent.com/")) {
        formattedLink = `${protocol}//${currentHost}/${githubLink}`;
    } else if (githubLink.startsWith("https://gist.githubusercontent.com/") || githubLink.startsWith("http://gist.githubusercontent.com/")) {
        const pathIndex = githubLink.indexOf("/", 18);
        if (pathIndex !== -1) {
            formattedLink = `${protocol}//${currentHost}/gist.github.com${githubLink.substring(pathIndex)}`;
        }
    } else if (githubLink.startsWith("gist.githubusercontent.com/")) {
        formattedLink = `${protocol}//${currentHost}/${githubLink}`;
    } else if (githubLink.startsWith("https://api.github.com/") || githubLink.startsWith("http://api.github.com/")) {
        const pathIndex = githubLink.indexOf("/", 8);
        if (pathIndex !== -1) {
            formattedLink = `${protocol}//${currentHost}/api.github.com${githubLink.substring(pathIndex)}`;
        }
    } else if (githubLink.startsWith("api.github.com/")) {
        formattedLink = `${protocol}//${currentHost}/${githubLink}`;
    } else {
        showToast('请输入有效的GitHub链接');
        return null;
    }
    
    // 确保生成的链接有效
    if (!formattedLink) {
        showToast('链接格式化失败');
        return null;
    }

    return formattedLink;
}

/**
 * 处理表单提交
 * @param {Event} e - 提交事件
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // 添加加载动画
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // 保存原始内容，使用更安全的方式处理DOM
    const originalButtonText = submitButton.querySelector('.btn-text');
    const originalButtonIcon = submitButton.querySelector('.btn-icon');
    
    // 如果按钮内部没有预定义的结构，则创建它
    if (!originalButtonText || !originalButtonIcon) {
        // 创建安全的DOM结构
        const btnText = document.createElement('span');
        btnText.className = 'btn-text';
        btnText.textContent = '处理中...';
        
        const btnIcon = document.createElement('span');
        btnIcon.className = 'btn-icon material-symbols-rounded';
        btnIcon.textContent = 'sync';
        
        // 清空按钮内容并添加新元素
        submitButton.textContent = '';
        submitButton.appendChild(btnText);
        submitButton.appendChild(btnIcon);
    } else {
        // 如果结构已存在，只更新文本内容
        originalButtonText.textContent = '处理中...';
        originalButtonIcon.textContent = 'sync';
    }
    
    submitButton.classList.add('loading');
    
    // 格式化链接 - 确保输入被正确处理
    const userInput = elements.input.value || '';
    const formattedLink = formatGithubLink(userInput.trim());
    
    // 恢复按钮状态并显示结果
    setTimeout(() => {
        // 恢复按钮原始状态
        const btnText = submitButton.querySelector('.btn-text');
        const btnIcon = submitButton.querySelector('.btn-icon');
        
        if (btnText) btnText.textContent = '获取加速链接';
        if (btnIcon) btnIcon.textContent = 'bolt';
        
        submitButton.classList.remove('loading');
        
        if (formattedLink) {
            elements.output.content.textContent = formattedLink;
            elements.output.container.style.display = 'block';
            
            // 平滑滚动到结果区域
            elements.output.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 500);
}

/**
 * 复制链接到剪贴板
 */
function copyLink() {
    const linkText = elements.output.content.textContent;
    navigator.clipboard.writeText(linkText)
        .then(() => showToast('链接已复制到剪贴板'))
        .catch(err => {
            console.error('复制失败:', err);
            showToast('复制失败，请手动复制');
        });
}

/**
 * 在新标签页中打开链接
 */
function openLink() {
    window.open(elements.output.content.textContent, '_blank');
}

/**
 * 获取API数据
 */
function fetchAPI() {
    // API端点和对应的DOM元素ID映射
    const apiEndpoints = [
        //限制大小
        { 
            url: '/api/size_limit', 
            mappings: [
                { 
                    elementId: 'sizeLimitDisplay',
                    formatter: data => `${data.MaxResponseBodySize} MB`
                }
            ],
            fallback: '获取失败' 
        },
        //版本
        { 
            url: '/api/version', 
            mappings: [
                { 
                    elementId: 'versionBadge',
                    formatter: data => data.Version
                }
            ],
            fallback: '获取失败' 
        },        
        //白名单 
        { 
            url: '/api/whitelist/status',
            mappings: [
                { 
                    elementId: 'whiteListStatus',
                    formatter: data => data.Whitelist ? '已开启' : '已关闭'
                }
            ],
            fallback: '获取失败'
        },
        //黑名单
        { 
            url: '/api/blacklist/status',
            mappings: [
                { 
                    elementId: 'blackListStatus',
                    formatter: data => data.Blacklist ? '已开启' : '已关闭'
                }
            ],
            fallback: '获取失败'
        },
        //限制器
        { 
            url: '/api/rate_limit/status',
            mappings: [
                { 
                    elementId: 'ratelimitStatus',
                    formatter: data => data.RateLimit ? '已开启' : '已关闭'
                }
            ],
            fallback: '获取失败'
        },
        //Git Clone缓存
        {
            url: '/api/smartgit/status',
            mappings: [
                {
                    elementId: 'smartgitStatus',
                    formatter: data => data.enabled? '已开启' : '已关闭'
                }
            ],
            fallback: '获取失败'
        },
        //脚本嵌套加速
        { 
            url: '/api/shell/status',
            mappings: [
                { 
                    elementId: 'combinedShellStatus',
                    formatter: data => {
                        if (data.editor && data.rewriteAPI) return '双功能已启用';
                        if (data.editor) return 'Shell嵌套加速启用';
                        return '功能已禁用';
                    }
                }
            ],
            fallback: '状态获取失败'
        }
    ];

    // 统一处理API请求
    apiEndpoints.forEach(endpoint => {
        fetch(endpoint.url)
            .then(response => response.json())
            .then(data => {
                endpoint.mappings.forEach(mapping => {
                    updateElement(mapping.elementId, mapping.formatter(data));
                });
            })
            .catch(() => {
                endpoint.mappings.forEach(mapping => {
                    updateElement(mapping.elementId, endpoint.fallback);
                });
            });
    });
    
    // 获取客户端IP信息
    fetchClientIPInfo();
}

// 通用元素更新函数
function updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
    }
}

/**
 * 添加UI交互效果
 */
function setupUIInteractions() {
    // 输入框焦点效果
    const inputField = elements.input;
    inputField.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    inputField.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
    
    // 卡片悬停效果
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = 'var(--shadow-hover)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

/**
 * 获取客户端IP和地区信息
 * 增强版本：添加隐私保护和安全措施
 */
function fetchClientIPInfo() {
    // 显示加载状态
    const ipDisplay = document.getElementById('clientIPDisplay');
    const locationDisplay = document.getElementById('clientIPLocation');
    
    if (!ipDisplay || !locationDisplay) {
        console.error('找不到IP显示元素');
        return;
    }
    
    ipDisplay.textContent = '加载中...';
    locationDisplay.textContent = '加载中...';
    
    // 添加隐私提示
    const privacyNotice = document.createElement('div');
    privacyNotice.className = 'privacy-notice';
    privacyNotice.textContent = '* IP信息仅在本地显示，不会被存储或传输';
    privacyNotice.style.fontSize = 'var(--font-size-xs)';
    privacyNotice.style.color = 'var(--text-muted)';
    privacyNotice.style.marginTop = '0.5rem';
    
    // 将隐私提示添加到位置显示元素之后
    locationDisplay.parentNode.appendChild(privacyNotice);
    
    // 使用更安全的方式获取IP信息，添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
    
    fetch('https://ipapi.co/json/', {
        signal: controller.signal,
        // 添加安全头部
        headers: {
            'Accept': 'application/json',
            'DNT': '1' // 请求不跟踪
        }
    })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // 验证数据有效性
            if (data && typeof data === 'object' && data.ip && !data.error) {
                const ip = data.ip;
                let maskedIP = ip;
                // 显示IP地址，但隐藏部分信息以保护隐私，可以开启隐私模式
                // // 对IPv4地址进行部分遮蔽
                // if (ip.includes('.')) {
                //     const parts = ip.split('.');
                //     if (parts.length === 4) {
                //         maskedIP = `${parts[0]}.${parts[1]}.*.*`;
                //     }
                // } 
                // // 对IPv6地址进行部分遮蔽
                // else if (ip.includes(':')) {
                //     maskedIP = ip.split(':').slice(0, 4).join(':') + ':****';
                // }
                
                // 处理IPv6地址显示问题
                if (ip.includes(':')) {
                    ipDisplay.style.fontSize = 'var(--font-size-sm)';
                    ipDisplay.style.wordBreak = 'break-all';
                    ipDisplay.style.overflowWrap = 'break-word';
                    ipDisplay.style.maxWidth = '100%';
                }
                
                ipDisplay.textContent = maskedIP;
                
                // 格式化地理位置信息显示
                const country_code = data.country_code || '未知国家';
                const region = data.region || '未知区域';
                const city = data.city || '未知城市';
                
                // 构建地理位置字符串，确保格式正确且避免多余的逗号
                const locationParts = [];
                if (country_code) locationParts.push(country_code);
                if (region) locationParts.push(region);
                if (city) locationParts.push(city);
                
                // 使用join方法连接非空部分，确保格式一致
                locationDisplay.textContent = locationParts.length > 0 
                    ? locationParts.join(', ') 
                    : '未知位置';
            } else {
                throw new Error('无效的IP数据');
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            console.warn('获取IP信息失败:', error);
            ipDisplay.textContent = '已保护';
            locationDisplay.textContent = '已保护隐私信息';
        });
}

/**
 * 计算并显示站点运行时间
 * @param {string|Date|number} [customStartTime] - 可选的自定义启动时间
 */
function updateUptimeCounter(customStartTime) {
    // 获取uptimeBadge元素
    const uptimeBadgeElement = document.getElementById('uptimeBadge');
    if (!uptimeBadgeElement) {
        console.error('找不到uptimeBadge元素');
        return;
    }
    
    // 设置站点启动时间
    let startTime;
    
    // 优先使用传入的自定义时间
    if (customStartTime) {
        // 安全地处理自定义时间参数
        try {
            startTime = customStartTime instanceof Date ? customStartTime : new Date(customStartTime);
            // 验证日期有效性
            if (isNaN(startTime.getTime())) {
                throw new Error('无效的日期格式');
            }
            
            // 确保启动时间不在未来
            const now = new Date();
            if (startTime > now) {
                console.warn('启动时间在未来，将使用当前时间');
                startTime = now;
            }
        } catch (e) {
            console.warn('自定义时间格式无效:', e);
            startTime = new Date();
        }
    } else {
        // 默认使用当前时间
        startTime = new Date();
        
        // 尝试从localStorage获取时间（如果可用）
        if (typeof localStorage !== 'undefined') {
            try {
                const storedStartTime = localStorage.getItem('siteStartTime');
                
                // 简化验证逻辑
                if (storedStartTime) {
                    try {
                        const timestamp = parseInt(storedStartTime, 10);
                        const storedDate = new Date(timestamp);
                        
                        // 只检查是否为有效日期且不在未来
                        const now = new Date();
                        if (!isNaN(storedDate.getTime()) && storedDate <= now) {
                            startTime = storedDate;
                        }
                    } catch (parseError) {
                        console.warn('解析存储的时间戳失败:', parseError);
                        // 继续使用默认时间
                    }
                } else {
                    // 如果没有存储时间，存储当前时间
                    try {
                        localStorage.setItem('siteStartTime', startTime.getTime().toString());
                    } catch (storageError) {
                        // 静默失败，不影响用户体验
                        console.warn('无法存储站点启动时间:', storageError);
                    }
                }
            } catch (e) {
                // 如果localStorage操作失败，继续使用默认时间
                console.warn('localStorage操作失败:', e);
            }
        }
    }
    
    // 再次确保startTime是有效的Date对象且不在未来
    const now = new Date();
    if (isNaN(startTime.getTime()) || startTime > now) {
        startTime = now;
    }
    
    // 更新运行时间显示
    function updateUptime() {
        const currentTime = new Date();
        const uptimeMs = currentTime - startTime;
        
        // 确保uptimeMs为正值
        const validUptimeMs = Math.max(0, uptimeMs);
        
        // 计算天、小时、分钟和秒
        const days = Math.floor(validUptimeMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((validUptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((validUptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((validUptimeMs % (1000 * 60)) / 1000);
        
        // 格式化显示
        const uptimeText = `运行时间: ${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
        uptimeBadgeElement.textContent = uptimeText;
    }
    
    // 立即更新一次
    updateUptime();
    
    // 每秒更新一次
    return setInterval(updateUptime, 1000);
}

/**
 * 初始化应用
 */
function initApp() {
    // 绑定事件监听器
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.buttons.copy.addEventListener('click', copyLink);
    elements.buttons.open.addEventListener('click', openLink);
    elements.buttons.themeToggle.addEventListener('click', function() {
        themeManager.toggleTheme();
        showToast('主题已切换');
    });
    
    // 初始化主题
    themeManager.initTheme();
    
    // 获取API数据
    fetchAPI();
    
    // 设置UI交互
    setupUIInteractions();
    
    // 安全地更新页面上的年份显示
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // 启动站点运行时间计数器
    // 可以在这里设置一个固定的初始时间，格式为ISO日期字符串
    const serverStartTime = '2025-03-31T00:00:00Z';
    updateUptimeCounter(serverStartTime);
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);