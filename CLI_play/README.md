# CLI Pong Game Guide


## Introduction
CLI Pong is a command-line interface (CLI) application that allows users to play the classic pong game in the terminal. CLI Pong app acts as a client that connects to a Django server to play the pong game. The game is played in the terminal, with paddles and a ball moving in real-time. Players can control their paddles using the arrow keys and compete to win the game.   

This guide provides detailed instructions on how to set up and play the CLI Pong game.


## Prerequisites
Before running the CLI Pong client, ensure you have the following:
- Python 3 is installed
- The `env_cli` file with necessary environment variables. It is used to configure the game (e.g., server URL, game mode, user credentials)
- The Django project running (which provides the backend for the game)
- Required Python packages installed (listed in `requirements_cli.txt`)

## Setup


### Step 1: Install and Activate `pyenv` 
Install `pyenv` to manage Python versions. Instructions from the official [pyenv GitHub repository](https://github.com/pyenv/pyenv).  

Activate `pyenv` and set the desired Python version:
```sh
pyenv install 3.11.8 # Replace with the desired Python version
pyenv virtualenv 3.11.8 cli-pong # The version can de skipped, it will use the current version
pyenv activate cli-pong
```

Install the required Python packages with `pip` using the provided `requirements_cli.txt` file:

```sh
pip install -r requirements_cli.txt
```

Libraries used:
```
asyncio
websockets
requests
python-dotenv
```


### Step 2: Configure Environment Variables

There is a file called `env_cli` that contains environment variables used by the CLI Pong game. 

```
...
# USER SETTINGS:
# = = = = = = =
# HOST=https://sbocanci.me
# USE_HTTPS=True
CLI_EMAIL=test@gmail.com
CLI_USERNAME=test
CLI_PASSWORD=qetwry135246

# GAME SETTINGS:
# = = = = = = = 

# Example Game modes (default is set to Single in the script):
# GAME_MODE=Single
# GAME_MODE=Multi_2
# GAME_MODE=Multi_3
# GAME_MODE=Multi_4

# GAME_ID=

```

- Update the `CLI_EMAIL`, `CLI_USERNAME`, and `CLI_PASSWORD` with your credentials. These credentials will be used to log in to the game server.

- The `GAME_MODE` variable can be set to `Single`, `Multi_2`, `Multi_3`, or `Multi_4` to specify the game mode. The default is `Single` and it is set in the script, so it can be skipped. For multiplayer modes decoment the respective line.  

- The `GAME_ID` variable is used to reference the specific game session. If it is not set, the script will request a new game session from the server.  



### Step 3: Ensure Django Server is Running

The CLI Pong client connects to a Django server to play the game. Ensure the Django server is running and accessible.  

The server URL is set in the `env_cli` file. The script will use the default server URL as `http://localhost:8000` if the `HOST` variable is not set.   
Update the `HOST` variable with the correct server URL if needed.  


**NOTE**:
- *If any unexpected behavior occurs, check the `LOG_CLI_PONG.log` file for error messages and debug information.* .   


## Running the Game

Once the setup is complete and the Django server is running, follow these steps to play the CLI Pong game:  

### Step 1: Start the CLI Pong Game

With `pyenv` activated and the required packages installed, run the `cli_pong.py` script:  
```sh
python cli_pong.py
```

- The script will automatically use the credentials provided in the `env_cli` file to log in. Ensure the email, username, and password are correctly set.

- The script will handle the creation or joining of a game session. You will be assigned a paddle (left or right).  


### Step 2: Play the Game

Use the following keys to control your paddle:
- **Up Arrow**: Move paddle up
- **Down Arrow**: Move paddle down

NOTE: 
- In `Single` mode you will be able to move both paddles. `w` and `s` keys are used to move the left paddle, and `Up` and `Down` arrow keys are used to move the right paddle.


The game state will be updated in real-time with the ball and paddles moving on the terminal screen.  


### Step 3: Game End

The game will end when one player wins. The winner will be displayed in the terminal. You can also quit the game at any time by pressing `Ctrl+C`.  

To play again, simply run the `cli_pong.py` script again with the desired settings.  


## Code Explanation

### Main Function

The main function initializes the game by getting user credentials, handling login, starting a game session, and running the game loop.

```python
def main(stdscr):
    email, username, password = get_credentials()
    if not email or not username or not password:
        return

    session, csrf_token = handle_login(email, username, password)
    if not session:
        return

    game_id, paddle = start_game_session(session, csrf_token)
    if not game_id:
        return    

    winner = None
    try:
        winner = run_game_loop(stdscr, session, csrf_token, game_id, paddle)
    except KeyboardInterrupt:
        logging.debug("Game stopped by user.")
        quit_game_session(session, csrf_token)
    finally:
        logging.debug("Game over. Winner: %s", winner)

    return winner
```


### Game Loop

The run_game_loop function handles the main game loop, updating the game state, drawing the game elements, and processing user input.

```python
def run_game_loop(stdscr, session, csrf_token, game_id, paddle):
    winner = None
    try:
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            message_type = data.get('type')

            if message_type == 'initial_state' or message_type == 'update_state':
                game_state = data.get('state')
                if not game_state:
                    game_state = data
                draw_game_state(stdscr, game_state)
            elif message_type == 'game_quit':
                logging.debug("Quit message received.")
            elif message_type == 'game_over':
                logging.debug("Game over message received.")
                winner = data.get('winner')

            paddle_input, direction = get_user_input(stdscr, paddle)
            logging.debug("Paddle: %s, Direction: %s", paddle_input, direction)
            if direction is not None:
                move_paddle(session, csrf_token, game_id, paddle_input, direction)
    except websockets.exceptions.ConnectionClosedOK:
        logging.debug("Websocket connection closed.")
    
    end_game_session(session, csrf_token, game_id)
        
    return winner
```


### Drawing Game State

The `draw_game_state` function uses the `curses` library to draw the game elements on the terminal screen.  

```python
def draw_game_state(stdscr, game_state):
    stdscr.clear()
    # Draw paddles, ball, and other game elements based on game_state
    stdscr.refresh()
```

The `curses` library in Python is used to draw the game elements on the terminal screen. This library provides provides a way to control the terminal screen, handle keyboard input, and draw text and shapes. This is a simple way to create a text-based game interface.  


## Logging

The game logs important events to a log file (`LOG_CLI_PONG.log`). This is useful for debugging and understanding the game's behavior.  
The logging file is created in the same directory each time the script is run.  
`logging_config.py` contains the logging configuration settings.  


## Testing API Calls

The file `api_requests.py` contains functions to access the Django server API endpoints.  
This file can be used by itself to test the API calls and responses without running the full game.  

To test the API calls, run the `api_requests.py` script:  
```sh
python api_requests.py
```

Requests and responses are logged to the same `LOG_CLI_PONG.log` file.  
