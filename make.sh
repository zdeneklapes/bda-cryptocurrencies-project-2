#!/bin/bash

###########################################################
###########################################################
RM="rm -rfd"
RED='\033[0;31m'
NC='\033[0m'
GREEN='\033[0;32m'

###########################################################
###########################################################
function pack() {
    # Clean and Zip project
    if [ "$ZIP_NAME" == "" ]; then die "ZIP_NAME is not set, please set it as: \`ZIP_NAME=project_name.zip ./make.sh pack\`"; fi

    CMD="zip -r '$ZIP_NAME' \
        .dockerignore \
        .editorconfig \
        .env.dev \
        Dockerfile.db \
        Dockerfile.development \
        Dockerfile.production \
        docker-compose.dev.yml \
        docker-compose.prod.yml \
        requirements.txt \
        .gitignore \
        README.md \
        pyproject.toml \
        src \
        .env \
        scripts \
        make.sh"
    if [ $DEBUG -eq 1 ]; then echo "$CMD"; else eval "$CMD"; fi
}

function ganache() {
    # Start ganache-cli
    CMD="pnpm ganache-cli -l 12500000 --mnemonic 'logic comic motion galaxy replace mimic warfare dilemma usual blame palm receive'"
    echo "$CMD"
    eval "$CMD"
}

function deploy () {
    # Deploy contracts
    CMD="pnpm truffle deploy --network development"
    echo "$CMD"
    eval "$CMD"
}

function help() {
    # Print usage on stdout
    echo "Available functions:"
    for file in "${BASH_SOURCE[0]}"; do
        function_names=$(cat ${file} | grep -E "(\ *)function\ +.*\(\)\ *\{" | sed -E "s/\ *function\ +//" | sed -E "s/\ *\(\)\ *\{\ *//")
        for func_name in ${function_names[@]}; do
            printf "    $func_name\n"
            awk "/function ${func_name}()/ { flag = 1 }; flag && /^\ +#/ { print \"        \" \$0 }; flag && !/^\ +#/ && !/function ${func_name}()/  { print "\n"; exit }" ${file}
        done
    done
}

function usage() {
    # Print usage on stdout
    help
}

function die() {
    # Print error message on stdout and exit
    printf "${RED}ERROR: $1${NC}\n"
    help
    exit 1
}

function main() {
    # Main function: Call other functions based on input arguments
    [[ "$#" -eq 0 ]] && die "No arguments provided"
    while [ "$#" -gt 0 ]; do
        "$1" || die "Unknown function: $1()"
        shift
    done
}
main "$@"
