# Profiler

A profiling tool for Big Data.

## Starting the Project

Profiler adopts a microservices architecture, and as such, has a number of dependent services.

#### Start Postgresql

    pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start

Start on port 5433.

#### Start Redis

    /usr/local/Cellar/redis/3.0.7/bin/redis-server

(Anaconda has its own embedded redis-server, which is incompatible if Anaconda is on the PATH.)
Starts on port 6379.

#### Start Artifactory

    cd <path-to>/artifactory
    ./bin/artifactory.sh

Starts on port 8081.

#### Start Gateway

    cd <path-to>/gateway
    ./gradlew clean build
    java -jar build/libs/gateway-1.0.jar

Starts on port 7001.

#### Start Forms API

    cd <path-to>/formsapi
    java -jar build/libs/formsapi-1.0.jar

Starts on port 7005.

#### Start Profiler API

    cd <path-to>/profiler
    java -jar build/libs/fileapi-1.0.jar

Starts on port 7007.

#### Start Profiler UI

    cd <path-to>/profiler-ui
    spring run app.groovy

Starts on port 7000.


Open the application on http://localhost:7000

The login credentials are user / password
