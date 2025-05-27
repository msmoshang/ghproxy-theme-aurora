document.addEventListener('DOMContentLoaded', () => {
    const githubForm = document.getElementById('github-form');
    const githubLinkInput = document.getElementById('githubLinkInput');
    const formattedLinkOutput = document.getElementById('formattedLinkOutput');
    const outputArea = document.getElementById('output');
    const copyButton = document.getElementById('copyButton');
    const openButton = document.getElementById('openButton');
    const flashContainer = document.querySelector('.flash-container');
    const versionBadge = document.getElementById('versionBadge');

    function showToast(message, type = 'success') {
        const flashMessage = document.createElement('div');
        flashMessage.className = `flash flash--${type}`;

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.textContent = type === 'success' ? 'check_circle' : 'error';

        flashMessage.appendChild(icon);
        flashMessage.appendChild(document.createTextNode(` ${message}`));

        flashContainer.appendChild(flashMessage);

        flashMessage.addEventListener('animationend', (e) => {
            if (e.animationName === 'flash-fadeOut') {
                flashMessage.remove();
            }
        });
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
            showToast('请输入有效的GitHub链接');
            return null;
        }

        return formattedLink;
    }

    githubForm.addEventListener('submit', function (e) {
        e.preventDefault();
        githubLinkInput.classList.remove('is-invalid');
        outputArea.style.display = 'none';

        const githubLink = githubLinkInput.value.trim();

        if (!githubLink) {
            showToast('请输入 GitHub 链接。', 'error');
            githubLinkInput.classList.add('is-invalid');
            return;
        }

        const formattedLink = formatGithubLink(githubLink);
        if (formattedLink) {
            formattedLinkOutput.value = formattedLink;
            outputArea.style.display = 'block';
        } else {
            showToast('请输入有效的 GitHub 链接 (例如 github.com, raw.githubusercontent.com)。', 'error');
            githubLinkInput.classList.add('is-invalid');
        }
    });

    githubLinkInput.addEventListener('input', () => {
        githubLinkInput.classList.remove('is-invalid');
    });

    copyButton.addEventListener('click', function () {
        if (!formattedLinkOutput.value) return;
        navigator.clipboard.writeText(formattedLinkOutput.value).then(() => {
            showToast('链接已复制到剪贴板', 'success');
        }).catch(err => {
            console.error('无法复制: ', err);
            showToast('复制失败', 'error');
        });
    });

    openButton.addEventListener('click', function () {
        if (!formattedLinkOutput.value) return;
        window.open(formattedLinkOutput.value, '_blank');
    });

    function fetchAPIStatus() {
        const updateElementText = (elementId, text) => {
            const el = document.getElementById(elementId);
            if (el) el.textContent = text;
        };

        const fetchData = (url, elementId, processFn) => {
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                    return response.json();
                })
                .then(data => updateElementText(elementId, processFn(data)))
                .catch(error => {
                    console.error(`Error fetching ${url}:`, error);
                    updateElementText(elementId, '加载失败');
                });
        };

        fetchData('/api/size_limit', 'sizeLimitDisplay', data => `${data.MaxResponseBodySize} MB`);
        fetchData('/api/whitelist/status', 'whiteListStatus', data => data.Whitelist ? '已开启' : '已关闭');
        fetchData('/api/blacklist/status', 'blackListStatus', data => data.Blacklist ? '已开启' : '已关闭');
        fetchData('/api/smartgit/status', 'gitCloneCacheStatus', data => (data && typeof data.enabled !== 'undefined') ? (data.enabled ? '已开启' : '已关闭') : '无法获取');
        fetchData('/api/oci_proxy/status', 'ociProxyStatus', data => (data && typeof data.enabled !== 'undefined') ? (data.enabled ? (data.target === 'ghcr' ? `使能(目标: ghcr.io)` : data.target === 'dockerhub' ? `使能(目标: DockerHub)` : `使能`) : '已关闭') : '无法获取');
        fetchData('/api/shell_nest/status', 'shellNestStatus', data => (data && typeof data.enabled !== 'undefined') ? (data.enabled ? '已开启' : '已关闭') : '无法获取');

        fetch('/api/version')
            .then(response => response.ok ? response.json() : Promise.reject(`HTTP error ${response.status}`))
            .then(data => {
                if (versionBadge) {
                    versionBadge.textContent = `v${data.Version}`;
                    versionBadge.style.display = 'inline-block';
                }
            })
            .catch(error => {
                console.error("Error fetching version:", error);
                if (versionBadge) versionBadge.style.display = 'none';
            });
    }

    fetchAPIStatus();
});