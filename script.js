document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const scale = 10;
    const rows = Math.floor(canvas.height / scale);
    const columns = Math.floor(canvas.width / scale);
    let score = 0;
    const frameRate = 8;
    const foodColors = ["red", "blue", "green", "orange", "yellow"];
    let bigFoodTimer = 0;
    let bigFoodVisible = false;
    let bigFoodDisappearTimer;
    let barriers = [];

    function Snake() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.xSpeed = scale * 1;
        this.ySpeed = 0;
        this.total = 0;
        this.tail = [];

        this.draw = function () {
            ctx.fillStyle = "white";
            ctx.shadowBlur = 10;
            ctx.shadowColor = "white";
            for (let i = 0; i < this.tail.length; i++) {
                ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
            }
            ctx.fillRect(this.x, this.y, scale, scale);
            ctx.shadowBlur = 0;
        };

        this.update = function () {
            for (let i = 0; i < this.tail.length - 1; i++) {
                this.tail[i] = this.tail[i + 1];
            }
            if (this.total > 0) {
                this.tail[this.total - 1] = { x: this.x, y: this.y };
            }

            this.x += this.xSpeed;
            this.y += this.ySpeed;

            if (this.x >= canvas.width) {
                this.x = 0;
            }
            if (this.y >= canvas.height) {
                this.y = 0;
            }
            if (this.x < 0) {
                this.x = canvas.width - scale;
            }
            if (this.y < 0) {
                this.y = canvas.height - scale;
            }
        };

        this.changeDirection = function (direction) {
            switch (direction) {
                case "ArrowUp":
                    if (this.ySpeed !== scale * 1) {
                        this.xSpeed = 0;
                        this.ySpeed = -scale * 1;
                    }
                    break;
                case "ArrowDown":
                    if (this.ySpeed !== -scale * 1) {
                        this.xSpeed = 0;
                        this.ySpeed = scale * 1;
                    }
                    break;
                case "ArrowLeft":
                    if (this.xSpeed !== scale * 1) {
                        this.xSpeed = -scale * 1;
                        this.ySpeed = 0;
                    }
                    break;
                case "ArrowRight":
                    if (this.xSpeed !== -scale * 1) {
                        this.xSpeed = scale * 1;
                        this.ySpeed = 0;
                    }
                    break;
            }
        };

        this.eat = function (food) {
            if (this.x === food.x && this.y === food.y) {
                this.total++;
                score++;
                document.getElementById('score').textContent = score;
                return true;
            }
            return false;
        };

        this.eatBigFood = function (bigFood) {
            if (
                this.x >= bigFood.x && this.x < bigFood.x + scale &&
                this.y >= bigFood.y && this.y < bigFood.y + scale
            ) {
                this.total += 1;
                score += 5;
                document.getElementById('score').textContent = score;
                return true;
            }
            return false;
        };
    }

    function Food() {
        this.x;
        this.y;
        this.colorIndex = 0;

        this.pickLocation = function () {
            this.x = (Math.floor(Math.random() * rows)) * scale;
            this.y = (Math.floor(Math.random() * columns)) * scale;
            this.colorIndex = (this.colorIndex + 1) % foodColors.length;
        };

        this.draw = function () {
            ctx.fillStyle = foodColors[this.colorIndex];
            ctx.shadowBlur = 20;
            ctx.shadowColor = foodColors[this.colorIndex];
            ctx.fillRect(this.x, this.y, scale, scale);
            ctx.shadowBlur = 0;
        };
    }

    function BigFood() {
        this.x;
        this.y;

        this.pickLocation = function () {
            this.x = (Math.floor(Math.random() * rows)) * scale;
            this.y = (Math.floor(Math.random() * columns)) * scale;
        };

        this.draw = function () {
            ctx.fillStyle = "white";
            ctx.shadowBlur = 20;
            ctx.shadowColor = "white";
            ctx.fillRect(this.x, this.y, scale, scale);
            ctx.shadowBlur = 0;
        };
    }

    function generateBarriers() {
        barriers = [];
        const barrierCount = 5; // Number of barriers

        for (let i = 0; i < barrierCount; i++) {
            let barrier;
            let overlap;
            do {
                overlap = false;
                const x = (Math.floor(Math.random() * (rows - 5)) + 1) * scale;
                const y = (Math.floor(Math.random() * (columns - 5)) + 1) * scale;
                const width = scale * (Math.floor(Math.random() * 3) + 2);
                const height = scale * (Math.floor(Math.random() * 3) + 2);

                barrier = { x, y, width, height };

                // Ensure barrier doesn't overlap with the initial snake position
                if (
                    (x < canvas.width / 2 + scale && x + width > canvas.width / 2 - scale) &&
                    (y < canvas.height / 2 + scale && y + height > canvas.height / 2 - scale)
                ) {
                    overlap = true;
                }

                // Ensure barriers don't overlap each other
                barriers.forEach(existingBarrier => {
                    if (
                        x < existingBarrier.x + existingBarrier.width &&
                        x + width > existingBarrier.x &&
                        y < existingBarrier.y + existingBarrier.height &&
                        y + height > existingBarrier.y
                    ) {
                        overlap = true;
                    }
                });

            } while (overlap);

            barriers.push(barrier);
        }
    }

    function drawBarriers() {
        ctx.fillStyle = "cyan";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "cyan";
        barriers.forEach(barrier => {
            ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        });
        ctx.shadowBlur = 0;
    }

    function checkCollisionWithBarriers(snake) {
        for (let i = 0; i < barriers.length; i++) {
            if (
                snake.x >= barriers[i].x &&
                snake.x < barriers[i].x + barriers[i].width &&
                snake.y >= barriers[i].y &&
                snake.y < barriers[i].y + barriers[i].height
            ) {
                return true;
            }
        }
        return false;
    }

    let snake = new Snake();
    let food = new Food();
    let bigFood = new BigFood();
    food.pickLocation();

    window.addEventListener("keydown", function (event) {
        snake.changeDirection(event.key);
    });

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        food.draw();
        snake.update();
        snake.draw();

        if (score >= 50) {
            drawBarriers();
            if (checkCollisionWithBarriers(snake)) {
                alert("Game Over!");
                snake.total = 0;
                snake.tail = [];
                score = 0;
                document.getElementById('score').textContent = score;
                barriers = [];
                generateBarriers();
            }
        }

        if (snake.eat(food)) {
            food.pickLocation();
        }

        if (bigFoodVisible) {
            bigFood.draw();
            if (snake.eatBigFood(bigFood)) {
                bigFoodVisible = false;
                clearTimeout(bigFoodDisappearTimer);
            }
        }

        for (let i = 0; i < snake.tail.length; i++) {
            if (snake.x === snake.tail[i].x && snake.y === snake.tail[i].y) {
                alert("Game Over!");
                snake.total = 0;
                snake.tail = [];
                score = 0;
                document.getElementById('score').textContent = score;
                barriers = [];
                generateBarriers();
            }
        }

        bigFoodTimer++;
        if (bigFoodTimer >= frameRate * 15) {
            bigFoodTimer = 0;
            bigFood.pickLocation();
            bigFoodVisible = true;
            clearTimeout(bigFoodDisappearTimer);
            bigFoodDisappearTimer = setTimeout(() => {
                bigFoodVisible = false;
            }, 2500);
        }

        setTimeout(update, 300 / frameRate);
    }

    generateBarriers();
    update();
});
