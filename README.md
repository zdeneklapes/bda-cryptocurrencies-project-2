# BDA CRYPTOCURRENCIES PROJECT

## Implementation of Ethereum Smart Contracts in `Solidity` and `Web3.js`


Project Explanation [On Youtube HERE](https://youtu.be/A-S_tL-pzFk?si=mC-Ezt-f94JnHY3Z)

### Authors:

- Zdenek Lapes - [lapes.zdenek@gmail.com](mailto:lapes.zdenek@gmail.com) - (xlapes02)

### How to Run the Program

To facilitate ease of reproducibility, I have created a containerized environment with all necessary dependencies using Docker (see `Dockerfile` and `docker-compose.yml`).

#### Installation:

1. **Clone the repository.**
2. **Start the Docker container:**

```bash
docker compose run --service-ports --build --entrypoint /usr/bin/fish bda
```

This command start 2 container:

- ``ganache-cli``: a local Ethereum blockchain for development purposes.
- and puts you into the 2nd container's shell using the fish shell, which also saves your entire history into the folder ./tmp/fish/, saving a lot of time.

---
**Now, run the following commands in the container's shell:**

3. Deploy the smart contracts:

```bash
npx truffle deploy --network development --reset
```

[//]: # (This command also generates a new contract address. Please copy this address and update the `.env.development` file's `NEXT_PUBLIC_CONTRACT_ADDRESS` variable.)
This command also generates a new contract address. Please copy this address and update the `contractAddress` variable inside `dapp/app/page.tsx` file.

4. Run the tests:

```bash
npx truffle test
```

4. Navigate to the `/app/dapp` folder:

```bash
cd /app/dapp
```

5. Start the frontend app:

```bash
npm install --force
npm run dev
```

6. Open the browser and go to the `localhost:3000`

7. Setup MetaMask

# TODO:

- Finish the Frontend App
