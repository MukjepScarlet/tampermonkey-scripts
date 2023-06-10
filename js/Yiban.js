// ==UserScript==
// @name         Yiban Resolve
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bypass!
// @author       konohaScarlet_
// @icon         https://www.google.com/s2/favicons?sz=64&domain=microsoft.com
// @grant        none
// @match        *://exam.yooc.me/group/*/exam/*/take
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9/crypto-js.min.js
// ==/UserScript==

async function request(url, options, content = "json") {
    const response = await fetch(url, options);
    return await response[content]();
}

function getCookie(key) {
    return document.cookie.split(';').find(cookie => cookie.includes(key)).split('=')[1];
}

async function main() {
    'use strict';

    const examId = window.location.href.match(/exam\/([0-9]+)?/)[1];
    const userId = document.cookie.match(/user_id=([0-9]+)?/)[1];

    const token = getCookie('user_token');
    const yibanId = getCookie('yiban_id');
    const examuserId = (await request(`https://exambackend.yooc.me/api/exam/setting/get?examId=${examId}&userId=${userId}&token=${token}&yibanId=${yibanId}`)).data.examuserId;
    const datas = (await request(`https://exambackend.yooc.me/api/exam/paper/get?examuserId=${examuserId}&token=${token}&yibanId=${yibanId}`))

    const nx = (e, r = false) => {
        const a = "yooc@admin";

        const c = CryptoJS.enc.Utf8.parse(CryptoJS.MD5(a + yibanId).toString().substring(8, 24));
        const l = CryptoJS.enc.Utf8.parse("42e07d2f7199c35d");

        if (r) e = a + e;

        return CryptoJS.AES[r ? "encrypt" : "decrypt"](
            e, c, {
            iv: l,
            mode: CryptoJS.mode.CBC
        }).toString(r ? "" : CryptoJS.enc.Utf8);
    }

    const decode = (encrypted, type, choices = []) => JSON.parse(nx(encrypted, false)).map(x => type == "completion" ? (x.join ? x.join(' | ') : x) : String.fromCharCode(65 + (choices && choices.length ? choices.indexOf(~~x) : ~~x))).join("、");

    const subjects = datas.data.map(sec => sec.subjects).reduce((acc, val) => acc.concat(val), []);
    const answers = subjects.map(subj => decode(subj.answer, subj.type));

    const m = document.getElementsByClassName("jsx-3643416060").item(0).parentElement;
    const ansTag = document.createElement("div");
    ansTag.setAttribute("id", "answer");
    m.appendChild(ansTag);

    // 题号变化随时更新
    const questionNumTag = document.getElementsByClassName("jsx-3527395752").item(3);

    questionNumTag.addEventListener("DOMSubtreeModified", e => {
        const newValue = e.target.data; // 改变后（现在）的题号
        let currentAnswer = answers[newValue - 1];
        if (typeof currentAnswer === "object") currentAnswer = currentAnswer.join("，");
        ansTag.innerHTML = `第${newValue}题答案：${currentAnswer}`;
    });

    // 0: Submit 1: Prev 2: Next
    const buttons = document.getElementsByClassName("jsx-751469096");

    document.addEventListener('keydown', event => {
        // 按下右方向键
        switch (event.keyCode) {
            case 37: // Left
                buttons.item(1).dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
                break;

            case 39: // Right
                buttons.item(2).dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
                break;
        }
    });
};

// 检测是否通过验证
while (!document.getElementsByClassName("jsx-3643416060").item(0))
    await new Promise(resolve => setTimeout(resolve, 100));

main();
