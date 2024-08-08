let maze = ["12111",
            "10001",
            "11011",
            "10001",
            "11131"]

let maze_holder = document.getElementById("maze_holder")
let player = document.getElementById("player")

let maze_height = 5
let maze_width = 5
let grid_size = parseInt(getComputedStyle(document.body).getPropertyValue("--grid_size"))

let player_x = 3.5
let player_y = 4.5
let player_radius = 0.125
let player_border = parseInt(getComputedStyle(player).getPropertyValue("--border_size"))

player.style.height = player_radius * grid_size * 2 - player_border * 2 + "px"
player.style.width = player_radius * grid_size * 2 - player_border * 2 + "px"

let keys_down = [false, false, false, false] // Up, Left, Down, Right

let player_speed = 3
let game_tick_interval = 10

function isInMaze(x_position, y_position) {
    return (x_position < 0 || y_position < 0 || x_position >= maze_width || y_position >= maze_height)
}

// Takes a x and y postion and returns true if it's a wall, false if not or out of maze
function isWall(x_position, y_position) {
    if (isInMaze(x_position, y_position)) {
        return false
    }
    return maze[y_position][x_position] == "1"
}

// Takes a x and y postion and returns true if it's an end, false if not or out of maze
function isEnd(x_position, y_position) {
    if (isInMaze(x_position, y_position)) {
        return false
    }
    return maze[y_position][x_position] == "2"
}

// Takes a x and y postion and returns true if it's the start, false if not or out of maze
function isStart(x_position, y_position) {
    if (isInMaze(x_position, y_position)) {
        return false
    }
    return maze[y_position][x_position] == "3"
}

function generateMaze() {
    for (let x = 0; x < maze_width; x++) {
        for (let y = 0; y < maze_height; y++) {
            if (isWall(x, y) || isEnd(x, y)) {
                let new_block = document.createElement("div")
                new_block.id = "block_" + x  + "_" + y
                new_block.style.gridRowStart = y + 1
                new_block.style.gridColumnStart = x + 1
                maze_holder.appendChild(new_block)
                if (isWall(x, y)) {
                    new_block.className = "maze_block"
                } else {
                    new_block.className = "end_block"
                }
            } else if (isStart(x, y)) {
                console.log(x, y)
                player_x = x + 0.5
                player_y = y + 0.5
            }
        }
    }
}

function drawPlayer() {
    player.style.left = (player_x - player_radius) * grid_size + "px"
    player.style.top = (player_y - player_radius) * grid_size + "px"
}

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
    let magnitude = Math.sqrt(Math.pow(player_x_input_delta, 2) + Math.pow(player_y_input_delta, 2))
    if (magnitude > 0) {
        player_x_input_delta /= magnitude
        player_y_input_delta /= magnitude
    }

    let player_x_delta = player_x_input_delta * player_speed * game_tick_interval/1000
    let player_y_delta = player_y_input_delta * player_speed * game_tick_interval/1000
    
    if (player_x_delta < 0) { // Player moving left
        // If grid to left of player is wall AND player is closer to wall than radius
        if (isWall(Math.floor(player_x) - 1, Math.floor(player_y)) && ((player_x % 1) + player_x_delta < player_radius)) {
            // Snap player to closest position to the wall
            player_x = Math.floor(player_x) + player_radius
        // If grid to left and up is wall AND player is closer to vertex than radius
        } else if (isWall(Math.floor(player_x) - 1, Math.floor(player_y) - 1) && (Math.pow(player_x % 1 + player_x_delta, 2) + Math.pow(player_y % 1, 2) < Math.pow(player_radius, 2))) {
            // Snap player to closest position to the vertex
            player_x = Math.floor(player_x) + Math.sqrt(Math.pow(player_radius, 2) - Math.pow(player_y % 1, 2))
        // If grid to left and down is wall AND player is closer to vertex than radius
        } else if (isWall(Math.floor(player_x) - 1, Math.floor(player_y) + 1) && (Math.pow(player_x % 1 + player_x_delta, 2) + Math.pow(1 - (player_y % 1), 2) < Math.pow(player_radius, 2))) {
            // Snap player to closest position to the vertex
            player_x = Math.floor(player_x) + Math.sqrt(Math.pow(player_radius, 2) - Math.pow(1 - (player_y % 1), 2))
        } else {
            // Nothing in the way
            player_x += player_x_delta
        }
    }

    else if (player_x_delta > 0) { // Player moving right
        // If grid to right of player is wall AND player is closer to wall than radius
        if (isWall(Math.floor(player_x) + 1, Math.floor(player_y)) && ((player_x % 1) + player_x_delta > 1 - player_radius)) {
            // Snap player to closest position to the wall
            player_x = Math.ceil(player_x) - player_radius
        // If grid to right and up is wall AND player is closer to vertex than radius
        } else if (isWall(Math.floor(player_x) + 1, Math.floor(player_y) - 1) && (Math.pow(1 - (player_x % 1 + player_x_delta), 2) + Math.pow(player_y % 1, 2) < Math.pow(player_radius, 2))) {
            // Snap player to closest position to the vertex
            player_x = Math.ceil(player_x) - Math.sqrt(Math.pow(player_radius, 2) - Math.pow(player_y % 1, 2))
        // If grid to right and down is wall AND player is closer to vertex than radius
        } else if (isWall(Math.floor(player_x) + 1, Math.floor(player_y) + 1) && (Math.pow(1 - (player_x % 1 + player_x_delta), 2) + Math.pow(1 - (player_y % 1), 2) < Math.pow(player_radius, 2))) {
            // Snap player to closest position to the vertex
            player_x = Math.ceil(player_x) - Math.sqrt(Math.pow(player_radius, 2) - Math.pow(1 - (player_y % 1), 2))
        } else {
            // Nothing in the way
            player_x += player_x_delta
        }
    }

    if (player_y_delta < 0) { // Player moving up
        // If grid above the player is wall AND player is closer to wall than radius
        if (isWall(Math.floor(player_x), Math.floor(player_y) - 1) && ((player_y % 1) + player_y_delta < player_radius)) {
            // Snap player to closest position to the wall
            player_y = Math.floor(player_y) + player_radius
        // If grid above and to the left is wall AND player is closer to vertex than radius
        } else if (isWall(Math.floor(player_x) - 1, Math.floor(player_y) - 1) && (Math.pow(player_x % 1, 2) + Math.pow(player_y % 1 + player_y_delta, 2) < Math.pow(player_radius, 2))) {
            // Snap player to closest position to the vertex
            player_y = Math.floor(player_y) + Math.sqrt(Math.pow(player_radius, 2) - Math.pow(player_x % 1, 2))
        // If grid above and to the right is wall AND player is closer to vertex than radius
        } else if (isWall(Math.floor(player_x) + 1, Math.floor(player_y) - 1) && (Math.pow(1 - (player_x % 1), 2) + Math.pow(player_y % 1 + player_y_delta, 2) < Math.pow(player_radius, 2))) {
            // Snap player to closest position to the vertex
            player_y = Math.floor(player_y) + Math.sqrt(Math.pow(player_radius, 2) - Math.pow(1 - (player_x % 1), 2))
        } else {
            // Nothing in the way
            player_y += player_y_delta
        }
    }

    else if (player_y_delta > 0) { // Player moving down
        // If grid above the player is wall AND player is closer to wall than radius
        if (isWall(Math.floor(player_x), Math.floor(player_y) + 1) && ((player_y % 1) + player_y_delta > 1 - player_radius)) {
            // Snap player to closest position to the wall
            player_y = Math.ceil(player_y) - player_radius
        // If grid under and to the left is wall AND player is closer to vertex than radius
        } else if (isWall(Math.floor(player_x) - 1, Math.floor(player_y) + 1) && (Math.pow(player_x % 1, 2) + Math.pow(1 - (player_y % 1 + player_y_delta), 2) < Math.pow(player_radius, 2))) {
            // Snap player to closest position to the vertex
            player_y = Math.ceil(player_y) - Math.sqrt(Math.pow(player_radius, 2) - Math.pow(player_x % 1, 2))
        // If grid above and to the right is wall AND player is closer to vertex than radius
        } else if (isWall(Math.floor(player_x) + 1, Math.floor(player_y) - 1) && (Math.pow(1 - (player_x % 1), 2) + Math.pow(1 - (player_y % 1 + player_y_delta), 2) < Math.pow(player_radius, 2))) {
            // Snap player to closest position to the vertex
            player_y = Math.ceil(player_y) - Math.sqrt(Math.pow(player_radius, 2) - Math.pow(1 - (player_x % 1), 2))
        } else {
            // Nothing in the way
            player_y += player_y_delta
        }
    }

    drawPlayer()

    maze_holder.style.left = document.documentElement.clientWidth / 2 - (player_x - player_radius) * grid_size + "px"
    maze_holder.style.top = document.documentElement.clientHeight / 2 - (player_y - player_radius) * grid_size + "px"

    console.log(player_x, player_y)

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

generateMaze()
drawPlayer()
let interval = setInterval(update, game_tick_interval)