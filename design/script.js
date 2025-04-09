const githubForm = document.getElementById('github-form');
const githubLinkInput = document.getElementById('githubLinkInput');
const formattedLinkOutput = document.getElementById('formattedLinkOutput');
const output = document.getElementById('output');
const copyButton = document.getElementById('copyButton');
const openButton = document.getElementById('openButton');
const toast = document.getElementById('toast');
const githubLinkError = document.getElementById('githubLinkError');
const customApiDataContainer = document.getElementById('customApiData');

function showToast(message) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('toast--visible');
    setTimeout(() => {
        toast.classList.remove('toast--visible');
    }, 3000);
}

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
        return null;
    }
    return formattedLink;
}



githubForm.addEventListener('submit', function (e) {
    e.preventDefault();
    githubLinkError.textContent = ''; 
    githubLinkError.classList.remove('text-field__error--visible');
    const githubLink = githubLinkInput.value.trim(); 

    if (!githubLink) {
        githubLinkError.textContent = '请输入 GitHub 链接';
        githubLinkError.classList.add('text-field__error--visible');
        githubForm.querySelector("button").disabled = false;
        return; 
    }

    const formattedLink = formatGithubLink(githubLink);
    if (formattedLink) {
        formattedLinkOutput.textContent = formattedLink;
        output.style.display = 'block';
    } else {
        githubLinkError.textContent = '请输入有效的 GitHub 链接';
        githubLinkError.classList.add('text-field__error--visible');
    }
});

githubLinkInput.addEventListener('input', () => {
    githubLinkError.textContent = '';
    githubLinkError.classList.remove('text-field__error--visible');
    const button = githubForm.querySelector("button");
    if (!githubLinkInput.value.trim()) {
        button.disabled = false;
    }
});

copyButton.addEventListener('click', function () {
    navigator.clipboard.writeText(formattedLinkOutput.textContent).then(() => {
        showToast('链接已复制到剪贴板');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showToast("复制失败");
    });
});

openButton.addEventListener('click', function () {
    window.open(formattedLinkOutput.textContent, '_blank');
});

function fetchAPI() {
    fetch('/api/size_limit')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('sizeLimitDisplay').textContent = `${data.MaxResponseBodySize} MB`;
        })
        .catch(error => {
            console.error("Error fetching size limit:", error);
            document.getElementById('sizeLimitDisplay').textContent = 'Error';
        });

    fetch('/api/whitelist/status')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('whiteListStatus').textContent = data.Whitelist ? '已开启' : '已关闭';
        })
        .catch(error => {
            console.error("Error fetching whitelist status:", error);
            document.getElementById('whiteListStatus').textContent = 'Error';
        });

    fetch('/api/blacklist/status')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('blackListStatus').textContent = data.Blacklist ? '已开启' : '已关闭';
        })
        .catch(error => {
            console.error("Error fetching blacklist status:", error);
            document.getElementById('blacklistStatus').textContent = 'Error';
        });

    fetch('/api/version')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('versionBadge').textContent = data.Version;
        })
        .catch(error => {
            console.error("Error fetching version:", error);
            document.getElementById('versionBadge').textContent = 'Error';
        });

    // --- Git Clone Cache Status ---
    fetch('/api/smartgit/status')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // 假设 API 返回 JSON 数据
        })
        .then(data => {
            const statusElement = document.getElementById('gitCloneCacheStatus');
            if (data && typeof data.enabled !== 'undefined') {
                statusElement.textContent = data.enabled ? '已开启' : '已关闭';
            } else {
                statusElement.textContent = '无法获取状态';
            }
        })
        .catch(error => {
            console.error("Error fetching Git Clone cache status:", error);
            document.getElementById('gitCloneCacheStatus').textContent = '加载失败';
        });
}

document.addEventListener('DOMContentLoaded', fetchAPI);