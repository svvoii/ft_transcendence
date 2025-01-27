import os
import logging


script_dir = os.path.dirname(os.path.abspath(__file__))
logfile_path = os.path.join(script_dir, 'LOG_CLI_PONG.log')

# Remove the existing log file if it exists
if os.path.exists(logfile_path):
    os.remove(logfile_path)

logging.basicConfig(filename=logfile_path, level=logging.DEBUG, format='%(levelname)s - %(message)s')
