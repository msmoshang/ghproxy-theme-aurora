const urlInput = document.getElementById('url-input');
const copyButton = document.getElementById('copy-button');
const currentUrlElement = document.getElementById('current-url');

// 简约弹窗
function showToast(message, type = 'info') {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.color = '#fff';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '1000';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-in-out';

    if (type === 'error') {
        toast.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
    } else if (type === 'success') {
        toast.style.backgroundColor = 'rgba(46, 204, 113, 0.9)';
    } else {
        toast.style.backgroundColor = 'rgba(52, 152, 219, 0.9)';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 1000);
}

function getCurrentUrl() {
    let url = window.location.href;
    if (!url.endsWith('/')) {
        url += '/';
    }
    return url;
}

document.addEventListener('DOMContentLoaded', function () {
    currentUrlElement.textContent = getCurrentUrl();

    document.getElementById('url-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const url = urlInput.value;
        if (url.toLowerCase().indexOf("github".toLowerCase()) < 0) {
            showToast("仅支持加速 GitHub", "error");
        } else {
            const currentUrl = getCurrentUrl();
            const fullUrl = currentUrl + url;
            window.open(fullUrl);
        }
    });
});

copyButton.addEventListener('click', function () {
    const url = urlInput.value;
    if (url.toLowerCase().indexOf("github".toLowerCase()) < 0) {
        showToast("请输入有效的 GitHub 链接！", "error");
    } else {
        const currentUrl = getCurrentUrl();
        const fullUrl = currentUrl + url;
        navigator.clipboard.writeText(fullUrl).then(() => {
            showToast("完整链接已复制到剪贴板！", "success");
        });
    }
});

function fetchAPI() {
    const apiEndpoints = [
        { url: '/api/size_limit', elementId: 'sizeLimitDisplay', successHandler: data => `大小限制：${data.MaxResponseBodySize} MB` },
        { url: '/api/whitelist/status', elementId: 'whiteListStatus', successHandler: data => data.Whitelist ? '白名单：已启用' : '白名单：未启用' },
        { url: '/api/blacklist/status', elementId: 'blackListStatus', successHandler: data => data.Blacklist ? '黑名单：已启用' : '黑名单：未启用' },
        { url: '/api/smartgit/status', elementId: 'gitCloneCacheStatus', successHandler: data => data.enabled ? 'Git缓存：开启' : 'Git缓存：关闭' },
        { url: '/api/version', elementId: 'versionBadge', successHandler: data => `版本：${data.Version}` }
    ];

    apiEndpoints.forEach(endpoint => {
        fetch(endpoint.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                document.getElementById(endpoint.elementId).textContent = endpoint.successHandler(data);
            })
            .catch(error => {
                console.error(`Error fetching ${endpoint.url}:`, error);
                document.getElementById(endpoint.elementId).textContent = '加载失败';
            });
    });
}

document.addEventListener('DOMContentLoaded', fetchAPI);