let maze = ["10111",
            "10001",
            "11101",
            "10001",
            "11101"]

let maze_holder = document.getElementById("maze_holder")
let player = document.getElementById("player")

let maze_height = 5
let maze_width = 5
let grid_size = 100

let player_x = 3.5
let player_y = 4.5
let player_radius = 0.125

player.style.height = player_radius * grid_size * 2 + "px"
player.style.width = player_radius * grid_size * 2 + "px"

let keys_down = [false, false, false, false] // Up, Left, Down, Right

let player_speed = 2
let game_tick_interval = 10

function isWall(x_position, y_poistion) {
    if (x_position < 0 || y_poistion < 0 || x_position >= maze_width || y_poistion >= maze_height) {
        return false
    }
    return maze[y_poistion][x_position] == "1"
}

for (let x = 0; x < maze_width; x++) {
    for (let y = 0; y < maze_height; y++) {
        if (isWall(x, y)) {
            let new_block = document.createElement("div")
            new_block.className = "maze_block"
            new_block.id = "block_" + x  + "_" + y
            new_block.style.left = grid_size * x + "px"
            new_block.style.top = grid_size * y + "px"
            maze_holder.appendChild(new_block)
        }
    }
}

function drawPlayer() {
    player.style.left = (player_x - player_radius) * grid_size + "px"
    player.style.top = (player_y - player_radius) * grid_size + "px"
}

window.addEventListener("keydown", function(event) {
    switch (event.key) {
        case "ArrowUp": keys_down[0] = true; break;
        case "ArrowLeft": keys_down[1] = true; break;
        case "ArrowDown": keys_down[2] = true; break;
        case "ArrowRight": keys_down[3] = true; break;
    }
})

window.addEventListener("keyup", function(event) {
    switch (event.key) {
        case "ArrowUp": keys_down[0] = false; break;
        case "ArrowLeft": keys_down[1] = false; break;
        case "ArrowDown": keys_down[2] = false; break;
        case "ArrowRight": keys_down[3] = false; break;
    }
})

function update() {
    let player_x_input_delta = 0
    let player_y_input_delta = 0
    if (keys_down[0]) {
        player_y_input_delta--
    }
    if (keys_down[1]) {
        player_x_input_delta--
    }
    if (keys_down[2]) {
        player_y_input_delta++
    }
    if (keys_down[3]) {
        player_x_input_delta++
    }
    let magnitude = Math.sqrt(player_x_input_delta*player_x_input_delta + player_y_input_delta*player_y_input_delta)
    if (magnitude > 0) {
        player_x_input_delta /= magnitude
        player_y_input_delta /= magnitude
    }

    let player_x_delta = player_x_input_delta * player_speed * game_tick_interval/1000
    let player_y_delta = player_y_input_delta * player_speed * game_tick_interval/1000
    
    if (player_x_delta < 0) {
        if (isWall(Math.floor(player_x) - 1, Math.floor(player_y))) {
            if ((player_x % 1) + player_x_delta < player_radius) {
                player_x = Math.floor(player_x) + player_radius
            } else {
                player_x += player_x_delta
            }
        } else {
            player_x += player_x_delta
        }
    }

    if (player_x_delta > 0) {
        if (isWall(Math.floor(player_x) + 1, Math.floor(player_y))) {
            if ((player_x % 1) + player_x_delta > 1 - player_radius) {
                player_x = Math.ceil(player_x) - player_radius
            } else {
                player_x += player_x_delta
            }
        } else {
            player_x += player_x_delta
        }
    }

    if (player_y_delta < 0) {
        if (isWall(Math.floor(player_x), Math.floor(player_y) - 1)) {
            if ((player_y % 1) + player_y_delta < player_radius) {
                player_y = Math.floor(player_y) + player_radius
            } else {
                player_y += player_y_delta
            }
        } else {
            player_y += player_y_delta
        }
    }

    if (player_y_delta > 0) {
        if (isWall(Math.floor(player_x), Math.floor(player_y) + 1)) {
            if ((player_y % 1) + player_y_delta > 1 - player_radius) {
                player_y = Math.ceil(player_y) - player_radius
            } else {
                player_y += player_y_delta
            }
        } else {
            player_y += player_y_delta
        }
    }

    drawPlayer()
}

drawPlayer()
let interval = setInterval(update, game_tick_interval)