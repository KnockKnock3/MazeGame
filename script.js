let maze = ["12111",
            "10001",
            "11011",
            "10001",
            "11131"]

let maze_holder = document.getElementById("maze_holder")
let player = document.getElementById("player")
let up_button = document.getElementById("up")
let left_button = document.getElementById("left")
let down_button = document.getElementById("down")
let right_button = document.getElementById("right")

let maze_height = 51
let maze_width = 51
let grid_size = parseInt(getComputedStyle(document.body).getPropertyValue("--grid_size"))

let player_x = 3.5
let player_y = 4.5
let player_radius = 0.125
let player_border = parseInt(getComputedStyle(player).getPropertyValue("--border_size"))

player.style.height = player_radius * grid_size * 2 - player_border * 2 + "px"
player.style.width = player_radius * grid_size * 2 - player_border * 2 + "px"

let arrow_keys_down = [false, false, false, false] // Up, Left, Down, Right
let wasd_keys_down = [false, false, false, false]
let buttons_down = [false, false, false, false]

let player_speed = 4
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
    let graph_height = (maze_height - 1) / 2
    let graph_width = (maze_width - 1) / 2
    let graph = Array(graph_height).fill(Array(graph_width).fill(3)).map(a => a.slice())
    for (let row = 0; row < graph_height; row++) {
        graph[row][graph_width - 1] = 1
    }
    let origin_row = graph_height - 1
    let origin_column = graph_width - 1
    graph[origin_row][origin_column] = 4
    for (let iteration = 0; iteration < 10000; iteration++) {
        // Get directions
        let directions = []
        if (origin_row > 0) {
            directions.push(0)
        }
        if (origin_column > 0) {
            directions.push(1)
        }
        if (origin_row < graph_height - 1) {
            directions.push(2)
        }
        if (origin_column < graph_width - 1) {
            directions.push(3)
        }
        // Choose direction
        let direction = directions[Math.floor(Math.random() * directions.length)];
        // Make current origin point in that direction
        graph[origin_row][origin_column] = direction
        // Move origin
        switch (direction) {
            case 0: origin_row--; break;
            case 1: origin_column--; break;
            case 2: origin_row++; break;
            case 3: origin_column++; break;
        }
        // Remove origins direction
        graph[origin_row][origin_column] = 4
    }
    maze = Array(maze_height).fill(Array(maze_width).fill("1")).map(a => a.slice())
    maze[0][1] = "2"
    maze[maze_height - 1][maze_width - 2] = "3"
    for (let row = 0; row < graph_height; row++) {
        for (let width = 0; width < graph_width; width++) {
            maze[row * 2 + 1][width * 2 + 1] = "0"
            switch (graph[row][width]) {
                case 0: maze[row * 2 ][width * 2 + 1] = "0"; break;
                case 1: maze[row * 2 + 1][width * 2] = "0"; break;
                case 2: maze[row * 2 + 2][width * 2 + 1] = "0"; break;
                case 3: maze[row * 2 + 1][width * 2 + 2] = "0"; break;
            }
        }
    }
}

function drawMaze() {
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
    if (arrow_keys_down[0] || buttons_down[0] || wasd_keys_down[0]) {
        player_y_input_delta--
    }
    if (arrow_keys_down[1] || buttons_down[1] || wasd_keys_down[1]) {
        player_x_input_delta--
    }
    if (arrow_keys_down[2] || buttons_down[2] || wasd_keys_down[2]) {
        player_y_input_delta++
    }
    if (arrow_keys_down[3] || buttons_down[3] || wasd_keys_down[3]) {
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

    //console.log(player_x, player_y)

}

window.addEventListener("keydown", function(event) {
    switch (event.key) {
        case "ArrowUp": arrow_keys_down[0] = true; break;
        case "ArrowLeft": arrow_keys_down[1] = true; break;
        case "ArrowDown": arrow_keys_down[2] = true; break;
        case "ArrowRight": arrow_keys_down[3] = true; break;

        case "w": wasd_keys_down[0] = true; break;
        case "a": wasd_keys_down[1] = true; break;
        case "s": wasd_keys_down[2] = true; break;
        case "d": wasd_keys_down[3] = true; break;
    }
})

window.addEventListener("keyup", function(event) {
    switch (event.key) {
        case "ArrowUp": arrow_keys_down[0] = false; break;
        case "ArrowLeft": arrow_keys_down[1] = false; break;
        case "ArrowDown": arrow_keys_down[2] = false; break;
        case "ArrowRight": arrow_keys_down[3] = false; break;

        case "w": wasd_keys_down[0] = false; break;
        case "a": wasd_keys_down[1] = false; break;
        case "s": wasd_keys_down[2] = false; break;
        case "d": wasd_keys_down[3] = false; break;
    }
})

up_button.onpointerdown = function() {
    buttons_down[0] = true
}
left_button.onpointerdown = function() {
    buttons_down[1] = true
}
down_button.onpointerdown = function() {
    buttons_down[2] = true
}
right_button.onpointerdown = function() {
    buttons_down[3] = true
}
up_button.onpointerup = function() {
    buttons_down[0] = false
}
left_button.onpointerup = function() {
    buttons_down[1] = false
}
down_button.onpointerup = function() {
    buttons_down[2] = false
}
right_button.onpointerup = function() {
    buttons_down[3] = false
}
up_button.onpointerleave = function() {
    buttons_down[0] = false
}
left_button.onpointerleave = function() {
    buttons_down[1] = false
}
down_button.onpointerleave = function() {
    buttons_down[2] = false
}
right_button.onpointerleave = function() {
    buttons_down[3] = false
}

generateMaze()
drawMaze()
drawPlayer()
let interval = setInterval(update, game_tick_interval)