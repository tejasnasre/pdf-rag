#!/bin/sh

# Start the API server
node index.js &

# Start the worker process
node worker.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
