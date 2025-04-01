/**
 * Aurora主题的JavaScript功能
 * 提供GitHub链接转换、UI交互和API数据获取功能
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
        open: document.getElementById('openButton')
    },
    toast: document.getElementById('toast')
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
    const currentHost = window.location.host;
    const protocol = window.location.protocol;
    let formattedLink = "";

    // 链接类型匹配
    if (githubLink.startsWith("https://github.com/") || githubLink.startsWith("http://github.com/")) {
        formattedLink = `${protocol}//${currentHost}/github.com${githubLink.substring(githubLink.indexOf("/", 8))}`;
    } else if (githubLink.startsWith("github.com/")) {
        formattedLink = `${protocol}//${currentHost}/${githubLink}`;
    } else if (githubLink.startsWith("https://raw.githubusercontent.com/") || githubLink.startsWith("http://raw.githubusercontent.com/")) {
        formattedLink = `${protocol}//${currentHost}${githubLink.substring(githubLink.indexOf("/", 7))}`;
    } else if (githubLink.startsWith("raw.githubusercontent.com/")) {
        formattedLink = `${protocol}//${currentHost}/${githubLink}`;
    } else if (githubLink.startsWith("https://gist.githubusercontent.com/") || githubLink.startsWith("http://gist.githubusercontent.com/")) {
        formattedLink = `${protocol}//${currentHost}/gist.github.com${githubLink.substring(githubLink.indexOf("/", 18))}`;
    } else if (githubLink.startsWith("gist.githubusercontent.com/")) {
        formattedLink = `${protocol}//${currentHost}/${githubLink}`;
    } else {
        showToast('请输入有效的GitHub链接');
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
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="btn-text">处理中...</span><span class="btn-icon material-symbols-rounded">sync</span>';
    submitButton.classList.add('loading');
    
    // 格式化链接
    const formattedLink = formatGithubLink(elements.input.value.trim());
    
    // 恢复按钮状态并显示结果
    setTimeout(() => {
        submitButton.innerHTML = originalText;
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
        { url: '/api/size_limit', elementId: 'sizeLimitDisplay', formatter: data => `${data.MaxResponseBodySize} MB`, fallback: '获取失败' },
        { url: '/api/whitelist/status', elementId: 'whiteListStatus', formatter: data => data.Whitelist ? '已开启' : '已关闭', fallback: '获取失败' },
        { url: '/api/blacklist/status', elementId: 'blackListStatus', formatter: data => data.Blacklist ? '已开启' : '已关闭', fallback: '获取失败' },
        { url: '/api/version', elementId: 'versionBadge', formatter: data => data.Version, fallback: 'Unknown' }
    ];

    // 统一处理API请求
    apiEndpoints.forEach(endpoint => {
        fetch(endpoint.url)
            .then(response => response.json())
            .then(data => {
                document.getElementById(endpoint.elementId).textContent = endpoint.formatter(data);
            })
            .catch(() => {
                document.getElementById(endpoint.elementId).textContent = endpoint.fallback;
            }); 
    });
    
    // 获取客户端IP信息
    fetchClientIPInfo();
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
 */
function fetchClientIPInfo() {
    // 直接使用ipapi.co获取IP和地区信息
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            if (data && data.ip && !data.error) {
                // 显示IP地址
                document.getElementById('clientIPDisplay').textContent = data.ip;
                
                // 显示地区信息
                const location = `${data.country_name || ''}${data.region ? ', ' + data.region : ''}${data.city ? ', ' + data.city : ''}`;
                document.getElementById('clientIPLocation').textContent = location;
            } else {
                document.getElementById('clientIPDisplay').textContent = '无法获取IP';
                document.getElementById('clientIPLocation').textContent = '无法获取地区信息';
            }
        })
        .catch(() => {
            document.getElementById('clientIPDisplay').textContent = '无法获取IP';
            document.getElementById('clientIPLocation').textContent = '无法获取地区信息';
        });
}

/**
 * 初始化应用
 */
function initApp() {
    // 绑定事件监听器
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.buttons.copy.addEventListener('click', copyLink);
    elements.buttons.open.addEventListener('click', openLink);
    
    // 获取API数据
    fetchAPI();
    
    // 设置UI交互
    setupUIInteractions();
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);