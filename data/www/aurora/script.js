// Aurora主题的JavaScript功能

const githubForm = document.getElementById('github-form');
const githubLinkInput = document.getElementById('githubLinkInput');
const formattedLinkOutput = document.getElementById('formattedLinkOutput');
const output = document.getElementById('output');
const copyButton = document.getElementById('copyButton');
const openButton = document.getElementById('openButton');
const toast = document.getElementById('toast');


// 显示提示信息
function showToast(message) {
    const toastMessage = document.querySelector('.toast-message');
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 格式化GitHub链接
function formatGithubLink(githubLink) {
    const currentHost = window.location.host;
    let formattedLink = "";

    if (githubLink.startsWith("https://github.com/") || githubLink.startsWith("http://github.com/")) {
        formattedLink = window.location.protocol + "//" + currentHost + "/github.com" + githubLink.substring(githubLink.indexOf("/", 8));
    } else if (githubLink.startsWith("github.com/")) {
        formattedLink = window.location.protocol + "//" + currentHost + "/" + githubLink;
    } else if (githubLink.startsWith("https://raw.githubusercontent.com/") || githubLink.startsWith("http://raw.githubusercontent.com/")) {
        formattedLink = window.location.protocol + "//" + currentHost + githubLink.substring(githubLink.indexOf("/", 7));
    } else if (githubLink.startsWith("raw.githubusercontent.com/")) {
        formattedLink = window.location.protocol + "//" + currentHost + "/" + githubLink;
    } else if (githubLink.startsWith("https://gist.githubusercontent.com/") || githubLink.startsWith("http://gist.githubusercontent.com/")) {
        formattedLink = window.location.protocol + "//" + currentHost + "/gist.github.com" + githubLink.substring(githubLink.indexOf("/", 18));
    } else if (githubLink.startsWith("gist.githubusercontent.com/")) {
        formattedLink = window.location.protocol + "//" + currentHost + "/" + githubLink;
    } else {
        showToast('请输入有效的GitHub链接');
        return null;
    }

    return formattedLink;
}

// 表单提交事件
githubForm.addEventListener('submit', function (e) {
    e.preventDefault();
    
    // 添加加载动画
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="btn-text">处理中...</span><span class="btn-icon material-symbols-rounded">sync</span>';
    submitButton.classList.add('loading');
    
    // 格式化链接
    const formattedLink = formatGithubLink(githubLinkInput.value);
    
    // 恢复按钮状态
    setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.classList.remove('loading');
        
        if (formattedLink) {
            formattedLinkOutput.textContent = formattedLink;
            output.style.display = 'block';
            
            // 平滑滚动到结果区域
            output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 500);
});

// 复制按钮点击事件
copyButton.addEventListener('click', function () {
    navigator.clipboard.writeText(formattedLinkOutput.textContent).then(() => {
        showToast('链接已复制到剪贴板');
    });
});

// 打开按钮点击事件
openButton.addEventListener('click', function () {
    window.open(formattedLinkOutput.textContent, '_blank');
});

// 移除主题切换按钮点击事件

// 获取API数据
function fetchAPI() {
    // 获取文件大小限制
    fetch('/api/size_limit')
        .then(response => response.json())
        .then(data => {
            document.getElementById('sizeLimitDisplay').textContent = `${data.MaxResponseBodySize} MB`;
        })
        .catch(() => {
            document.getElementById('sizeLimitDisplay').textContent = '获取失败';
        });

    // 获取白名单状态
    fetch('/api/whitelist/status')
        .then(response => response.json())
        .then(data => {
            document.getElementById('whiteListStatus').textContent = data.Whitelist ? '已开启' : '已关闭';
        })
        .catch(() => {
            document.getElementById('whiteListStatus').textContent = '获取失败';
        });

    // 获取黑名单状态
    fetch('/api/blacklist/status')
        .then(response => response.json())
        .then(data => {
            document.getElementById('blackListStatus').textContent = data.Blacklist ? '已开启' : '已关闭';
        })
        .catch(() => {
            document.getElementById('blackListStatus').textContent = '获取失败';
        });

    // 获取版本信息
    fetch('/api/version')
        .then(response => response.json())
        .then(data => {
            document.getElementById('versionBadge').textContent = data.Version;
        })
        .catch(() => {
            document.getElementById('versionBadge').textContent = 'Unknown';
        });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取API数据
    fetchAPI();
    
    // 添加输入框焦点效果
    const inputField = document.getElementById('githubLinkInput');
    inputField.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    inputField.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
    
    // 添加卡片悬停效果
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
});