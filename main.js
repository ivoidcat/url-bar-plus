// ==UserScript==
// @name         url-bar-plus 优化的自定义网址输入框
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  在网页底部添加一个网址输入框，显示当前网址并允许修改，支持多行显示并自适应高度，协议、主机地址与路径用不同颜色显示，使用快捷键Ctrl+K隐藏与显示，使用cookie记住上次的状态，并增加了更多用户体验优化
// @author       cat
// @match        *://*/*
// @grant        none
// @license MIT
// ==/UserScript==
 
(function() {
    'use strict';
 
    // 样式定义
    const styles = `
        #custom-url-input {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            font-size: 16px;
            padding: 10px;
            border-top: 2px solid #ccc;
            background-color: rgba(249, 249, 249, 0.95);
            z-index: 10000;
            white-space: pre-wrap;
            overflow-wrap: break-word;
            overflow: hidden;
            min-height: 30px;
            max-height: 150px;
            transition: all 0.3s ease;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }
        #custom-url-input:focus {
            outline: none;
            border-top-color: #007BFF;
        }
        #custom-url-input:hover {
            background-color: rgba(249, 249, 249, 1);
        }
        #custom-url-input-tooltip {
            position: fixed;
            bottom: 100%;
            left: 10px;
            background-color: #333;
            color: #fff;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            display: none;
        }
    `;
 
    // 创建样式元素
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
 
    // 创建输入框
    const urlInput = document.createElement('div');
    urlInput.id = 'custom-url-input';
    urlInput.contentEditable = true;
    urlInput.innerHTML = colorizeUrl(window.location.href);
    document.body.appendChild(urlInput);
 
    // 创建提示框
    const tooltip = document.createElement('div');
    tooltip.id = 'custom-url-input-tooltip';
    tooltip.textContent = 'Ctrl+K: 显示/隐藏 | Enter: 跳转 | Shift+Enter: 换行';
    document.body.appendChild(tooltip);
 
    // 初始化显示状态
    urlInput.style.display = getCookie('urlInputDisplay') || 'block';
 
    // 事件监听器
    urlInput.addEventListener('keydown', handleKeyDown);
    urlInput.addEventListener('input', handleInput);
    urlInput.addEventListener('focus', () => tooltip.style.display = 'block');
    urlInput.addEventListener('blur', () => tooltip.style.display = 'none');
    window.addEventListener('popstate', updateUrl);
    document.addEventListener('keydown', handleGlobalKeyDown);
 
    // 颜色化网址函数
    function colorizeUrl(url) {
        const parts = url.match(/^([^:]+:)(\/\/[^\/]+)(.*)/);
        if (!parts) return url;
        const [, protocol, host, path] = parts;
        return `<span style="color: #007BFF;">${protocol}</span>` +
               `<span style="color: #28A745;">${host}</span>` +
               `<span style="color: #DC3545;">${path}</span>`;
    }
 
    // 处理键盘事件
    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const newUrl = urlInput.innerText.trim();
            if (newUrl) {
                window.location.href = newUrl;
            }
        }
    }
 
    // 处理输入事件
    function handleInput() {
        adjustHeight(urlInput);
        const selectionStart = window.getSelection().getRangeAt(0).startOffset;
        const selectionEnd = window.getSelection().getRangeAt(0).endOffset;
        urlInput.innerHTML = colorizeUrl(urlInput.innerText);
        // 恢复光标位置
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(urlInput.childNodes[0], selectionStart);
        range.setEnd(urlInput.childNodes[0], selectionEnd);
        sel.removeAllRanges();
        sel.addRange(range);
    }
 
    // 更新URL
    function updateUrl() {
        urlInput.innerHTML = colorizeUrl(window.location.href);
        adjustHeight(urlInput);
    }
 
    // 处理全局键盘事件
    function handleGlobalKeyDown(event) {
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            toggleUrlInput();
        }
    }
 
    // 切换输入框显示状态
    function toggleUrlInput() {
        urlInput.style.display = urlInput.style.display === 'none' ? 'block' : 'none';
        setCookie('urlInputDisplay', urlInput.style.display);
        if (urlInput.style.display === 'block') {
            urlInput.focus();
        }
    }
 
    // 调整高度
    function adjustHeight(element) {
        element.style.height = 'auto';
        element.style.height = Math.min(element.scrollHeight, 150) + 'px';
    }
 
    // 设置 cookie
    function setCookie(name, value, days = 365) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }
 
    // 获取 cookie
    function getCookie(name) {
        const cookieArr = document.cookie.split(';');
        for (let i = 0; i < cookieArr.length; i++) {
            const cookiePair = cookieArr[i].split('=');
            if (name === cookiePair[0].trim()) {
                return decodeURIComponent(cookiePair[1]);
            }
        }
        return null;
    }
 
    // 初始化
    adjustHeight(urlInput);
})();