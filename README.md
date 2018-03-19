# AdvancedNodeStarter

Starting project for a course on Advanced Node @ Udemy

# yml is just simple json -- you can convert it over easy

language: node_js

# array

node_js:

* "8" #version of node
  dist: trusty #virtual machine
  # need to tell travis to use its own local mongo and redis-server
  servers:
* mongodb
* redis-server
  env: # set the node envioronment variables to be used in project
  # tell express to start on port 3000 && set node env to ci -- needs to be on same line!!!
* NODE_ENV=ci PORT=3000
  cache: #tell travis to use cache version of node_modules so it doesnt install each time
  directories: - node_modules - client/node_modules
  install: #look at package.json...
* npm install
* npm run build
  script:
  # noup: if shell is closed, dont kill anything this command creates
  # &: run this command in background - works without noup...
* nohup npm run start &
* sleep 3 # wait for 3sec for server to start up before run test
* npm run test
