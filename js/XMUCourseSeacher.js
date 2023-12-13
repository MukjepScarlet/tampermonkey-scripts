// ==UserScript==
// @name         XMU Course Search Utils
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Search!
// @author       konohaScarlet_
// @icon         https://www.google.com/s2/favicons?sz=64&domain=microsoft.com
// @grant        none
// @match        *://course.xmu.edu.cn/meol/common/question/test/student/stu_qtest_main.jsp*
// @match        *://course2.xmu.edu.cn/meol/common/question/test/student/stu_qtest_main.jsp*
// @require      https://cdn.staticfile.org/clipboard.js/2.0.4/clipboard.min.js
// ==/UserScript==

/**
 * 使用时, 一定要在新标签页答题!
 * 主要功能: 一键复制题目/一键搜索题目
 * 辅助功能: ENTER键保存答案并进入下一题
 */

function click(element) {
    element.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    }));
}

function main() {
    'use strict';

    const questionFrame = document.getElementById('questionshow');

    const mainBox = document.getElementsByClassName('center')[0];

    const buttonRow = questionFrame.contentDocument.getElementsByClassName('buttonc').item(0);

    const copyButton = document.createElement("input")
    copyButton.id = "copy-btn";
    copyButton.type = copyButton.className = 'button';
    copyButton.value = '复制';

    mainBox.appendChild(copyButton);

    const searchButton = document.createElement("input");
    searchButton.type = searchButton.className = 'button';
    searchButton.value = '搜索';

    mainBox.appendChild(searchButton);
    // 创建下拉列表
    const selectList = document.createElement('select');
    const searchEngines = {
        "百度": "https://www.baidu.com/s?wd=", // 百度无法显示, 可能有问题
        "搜狗": "https://www.sogou.com/web?query=",
        "360": "https://www.so.com/s?q=", // 360 验证码触发很快
        "必应": "https://www.bing.com/search?q="
    };
    for (const engine in searchEngines) {
        const option = document.createElement('option');
        option.value = engine;
        option.textContent = engine;
        selectList.appendChild(option);
    }
    mainBox.appendChild(selectList);

    const resultFrame = document.createElement('iframe');
    resultFrame.style.width = '100%';
    resultFrame.style.height = '1000px';
    mainBox.appendChild(resultFrame);

    searchButton.onclick = () => {
        const searchString = questionFrame.contentDocument.getElementsByTagName('iframe')[0]
            .contentDocument.getElementById('body').innerText;
        const searchUrl = searchEngines[selectList.value] + encodeURIComponent(searchString);
        resultFrame.src = searchUrl;
        // window.open(searchUrl, "_blank"); // 新标签页
    }

    new ClipboardJS('#copy-btn', {
        text: t => questionFrame.contentDocument.getElementsByTagName('iframe')[0]
                .contentDocument.getElementById('body').innerText
    }).on('success', e => {
       e.clearSelection();
    }).on('error', e => {
        alert('Copy Failed');
    });

    document.addEventListener('keydown', event => {
        switch (event.keyCode) {
            case 8: // BackSpace
            case 46: // Delete
                click(buttonRow.children[0]); // reset
                break;

            case 13: // Enter
                click(buttonRow.children[1]); // save
                break;
        }
    });
}

main();
