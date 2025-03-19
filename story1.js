document.addEventListener("keydown", (event) => {
    if (event.code === 'Space') {
        if (textSwitch === true) {
            textCount++;
            console.log(textCount);
            if (textCount === 1) {
                storyText = `<ゆっくり><br>ゆっくりしていってね`;
            } else if (textCount === 2) {
                textSwitch = false; 

                storyBackground.style.backgroundColor = `rgba(0, 0, 0, 0)`;
                storyText = ``;
                textWindow.style.backgroundColor = `rgba(0, 0, 0, 0)`;
                textWindow.style.border = `0px`;

                gameStart();
                gameStartSwitch = false;
            } else if (textCount === 3) {
                storyText = `<ゆっくり><br>プログラミング得意な人は<br>パラメーター色々弄って遊んでみてね`;
            }
            text.innerHTML = storyText;
        }
    }
})