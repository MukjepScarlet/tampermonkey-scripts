// ==UserScript==
// @name         Yiban Resolve
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Bypass!
// @author       konohaScarlet_
// @icon         https://www.google.com/s2/favicons?sz=64&domain=microsoft.com
// @grant        none
// @match        *://exam.yooc.me/group/*/exam/*
// ==/UserScript==

const decode = {
    "=4WatRWYAN2bvlXXiMjIsISMiwiIwIyW": ["A", "B", "D"],
    "=4WatRWYAN2bvlXXiMjIsIiMiwiIwIyW": ["A", "C", "D"],
    "=4WatRWYAN2bvlXXiIjIsISMiwiIwIyW": ["A", "B", "C"],
    "=4WatRWYAN2bvlXXiQjIsIiMiwiIwIyW": ["A", "C", "E"],
    "=4WatRWYAN2bvlXXiMjIsIiMiwiIxIyW": ["B", "C", "D"],
    "=4WatRWYAN2bvlXXiQjIsISMiwiIwIyW": ["A", "B", "E"],
    "==gbp1GZhB0Yv9WedJSMiwiIwIyW": ["A", "B"],
    "==gbp1GZhB0Yv9WedJiMiwiIwIyW": ["A", "C"],
    "==gbp1GZhB0Yv9WedJiMiwiIxIyW": ["B", "C"],
    "==gbp1GZhB0Yv9WedJyMiwiIxIyW": ["B", "D"],
    "ulWbkFGQj92b51lIzICLiIjIsISMiwiIwIyW": ["A", "B", "C", "D"],
    "ulWbkFGQj92b51lI0ICLiIjIsISMiwiIwIyW": ["A", "B", "C", "E"],
    "ulWbkFGQj92b51lI0ICLiMjIsIiMiwiIwIyW": ["A", "C", "D", "E"],
    "==gbp1GZhB0Yv9WedJCNiwiIzICLiIjIsISMiwiIwIyW": ["A", "B", "C", "D", "E"],
    "S+xUEw7naejDmkN3dm8ESw==": "A",
    "MXz/ccgKyTDm4S07GwdZSQ==": "B",
    "LVXqNuIbrI4w1S9XcwBWxQ==": "C",
    "B0jjbql+rpI89IcabXBtIw==": "D",
    "lbMHM29yZx4xQ3i31EBQSw==": "E",

    "ekB9RCpjA7nx6HLFU0S4fg==": "A",
    "UwSNPvAWlrIKUaoSUwriYg==": "B",
    "7x3PE4EgG6NoxX3LCMK4wA==": "C",
    "vaY5L2z2gxedI4LkQv2w1g==": "D",
    "vavVp23XuSjK8xbuKyfl1TchwQ71j44zrebljBy\/z1I=": ["A", "B", "C", "D", "E"],
    "vavVp23XuSjK8xbuKyfl1Y6mgg6b7yzcgUto9rTBlms=": ["A", "B", "C", "D"],
    "LE0pFroqYLH0DhSPvhpIbA==": ["A", "B", "C"],
    "KOKP6em09Uqn5P13lIf8Kg==": ["A", "B", "D"],
    "lKe/G3bBu2t/JiXIa9TSlA==": ["B", "C", "D"],
    "NzXaQ8Zvzb1spWYZiaKMKQ==": ["A", "B"],
    "ojbn01F+UgOOSERjnNnBwQ==": ["A", "C"],
    "0Pu0+A3LVJmTeoZSdUeYzg==": ["A", "D"],
    "TCujI7LvF9+S7D5yeRyzWg==": ["B", "C"],
    "XR17648FKif4ktUCZF9h0w==": ["B", "D"],
    "wam44wmBSSNN4dPi8eZl4w==": ["C", "D"],

    "pUsI4QDZBgi6a+MSlczzzC9g0o1iViM8WF5iFZwdANQ=": ["A", "B", "C", "D"],
    "L/iKJ/gMhE3fBYXxVEn3iA==": ["A", "C", "D"],
    "X0tFOdyxRmxLwcF+4Nu+jQ==": ["A", "B", "C"],
    "I6zV3xcySnWk/kqy868riw==": ["A", "B"],
    "vsAyq1dI1vDG1AZ+TOVZVQ==": ["A", "C"],
    "RyaO9eiwz9Yd9fwVJHxsdQ==": ["A", "D"],
};

async function request(url, options) {
    const response = await fetch(url, options);
    const resJson = await response.json();
    return resJson;
}

async function main() {
    'use strict';

    const examId = window.location.href.match(/exam\/([0-9]+)?/)[1];
    const userId = document.cookie.match(/user_id=([0-9]+)?/)[1];

    const token = document.cookie.split(';').find(cookie => cookie.includes('user_token')).split('=')[1];
    const yiban_id = document.cookie.split(';').find(cookie => cookie.includes('yiban_id')).split('=')[1];
    const examuserId = (await request(`https://exambackend.yooc.me/api/exam/setting/get?examId=${examId}&userId=${userId}&token=${token}&yibanId=${yiban_id}`)).data.examuserId;
    const datas = (await request(`https://exambackend.yooc.me/api/exam/paper/get?examuserId=${examuserId}&token=${token}&yibanId=${yiban_id}`))

    const subjects = datas.data.map(sec => sec.subjects).reduce((acc, val) => acc.concat(val), []);
    const answers = subjects.map(subj => decode[subj.answer] ?? "答案不在库中");

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
