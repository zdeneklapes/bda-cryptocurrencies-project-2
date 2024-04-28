#FROM node:18
FROM ubuntu:20.04

ENV NEXT_TELEMETRY_DISABLED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV SHELL="/usr/bin/bash"
SHELL ["/usr/bin/bash", "-c"]
WORKDIR /app

# Install system packages (Base packages)
RUN <<EOF
    --mount=type=cache,mode=0777,target=/var/cache/apt
    set -ex
    apt-get update
    apt-get upgrade -y
    apt-get install -y \
        fish \
        cron \
        lsb-release \
        vim \
        autoconf \
        automake \
        libtool \
        make \
        pkgconf \
        nasm \
        file \
        gcc \
        musl-dev \
        tree \
        curl \
        git \
        nodejs \
        npm \
        wget \
        unzip
    rm -rf /var/lib/apt/lists/*
EOF

# Install node version 18
RUN <<EOF
    set -ex
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install nodejs -y
EOF

# Install watchman
#WORKDIR /root
#RUN <<EOF
#    set -ex
#    wget https://github.com/facebook/watchman/archive/refs/tags/v2024.04.22.00.tar.gz
#    tar -xzvf v2024.04.22.00.tar.gz
#    cd watchman-2024.04.22.00
#    ./autogen.sh
#EOF
#WORKDIR /app

# Install npm project packages
COPY package.json package-lock.json /app/
RUN <<EOF
    set -ex
    npm install
EOF
