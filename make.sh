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
    pwd_name=$(basename `pwd`)
    if [ "$ZIP_NAME" == "" ]; then ZIP_NAME="${pwd_name}.zip"; fi
    if [ "$DEBUG" == "" ]; then DEBUG=0; fi

    CMD="zip -r '$ZIP_NAME' \
        config \
        contracts \
        migrations \
        dapp/app \
        dapp/components \
        dapp/lib \
        dapp/public \
        dapp/.env.development \
        dapp/.eslintrc.json \
        dapp/next.config.mjs \
        dapp/package.json \
        dapp/package-lock.json \
        dapp/postcss.config.mjs \
        dapp/tailwind.config.ts \
        dapp/tsconfig.json \
        test \
        docker-compose.yml \
        .secret \
        Dockerfile \
        DOCUMENTATION.pdf \
        make.sh \
        package.json \
        package-lock.json \
        README.md \
        truffle-config.js \
        "
    if [ $DEBUG -eq 1 ]; then echo "$CMD"; else eval "$CMD"; fi
    echo -e "${GREEN}Project packed into $ZIP_NAME${NC}"
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

function abi() {
    CMD1="cd /app"
    CMD2="npx truffle deploy --network development --reset"
    CMD3="cd /app/dapp"
    CMD4="rm app/BDAToken.json"
    CMD5="cp ../build/contracts/BDAToken.json app/"
    for cmd in "$CMD1" "$CMD2" "$CMD3" "$CMD4" "$CMD5"; do
        echo "$cmd"
        eval "$cmd"
    done
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
