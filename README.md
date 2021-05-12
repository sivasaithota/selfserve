# selfserve-analytics-center

This repository contains the source code for the app part of OpenX. 

Repository is split into 3 parts:
* /app - contains the main server code developed using express
* /public - contains the angularjs frontend code
* /preProcessor - contains the code needed to deploy and upgrade app

Backend runs on node 14 and frontend uses node 10 because of gulp dependency. Dockerbuild is a multistage build process that uses different base images for frontend and backend. Final image will contain only node 14 so frontend cannot be built with final image.

PreProcessor is only called from jenkins on app upgrade and deployment. PreProcessor contains all the postgres functions and upgrade scripts. 

To run the watcher for the frontend assets rebuilding on change, run **gulp dev** 

Steps to start Analytics center in Swarm Dev Environment:

 Install npm packages (first time only)  
```docker-compose up install ```

#### Install bower packages (first time only)  
```docker-compose up bower```

#### Start the server  
`docker stack deploy enframe -c docker-stack.yml`

#### Restart the service
`docker rm -f -v $(docker ps -a | grep enframe_analytics_center | awk '{print $1}')`

#### Get container logs
`docker logs -f  $(docker ps -a | grep enframe_analytics_center | awk '{print $1}')`

#### Get service logs
`docker service logs -f enframe_analytics_center`

#### Remove service
`docker service rm enframe_analytics_center`

#### Upgrade apps
Upgrade - `npm run migrate-up`
Downgrade - `npm run migrate-down -- --appId=<appId>`

#### Frontend development
You can also work on local setup by installing node 10 and then running `npm install` and `./node_modules/.bin/bower install`
To build, run `npm run build` and to watch for frontend asset changes, run `npm run dev`
