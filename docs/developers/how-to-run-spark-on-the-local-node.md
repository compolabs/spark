# How to run Spark on the local node

{% hint style="info" %}
```
Local node accounts private keys
ADMIN=806e4997e9f54373564eae2da8b28f3f184e91bb0409ec1c9c38740465dceb71
ALICE=0da41b477ec84d3569179e48e608d5b3e5a2f7dab24be1ca0cd0da42e5e42781
BOB=39a33b415866e48a8a600df88af0759baaff001669a8938eebfc9641c1be25bd
```
{% endhint %}

### Setting up a local Fuel network

1.  Clone the Spark repository by running the command:

    ```bash
    git clone git@github.com:compolabs/spark.git
    ```
2.  Navigate to the cloned repository directory by running:

    ```bash
    cd spark
    ```
3.  Switch to the `local-node` branch by running:

    ```lua
    git checkout local-node
    ```
4.  Start a local Fuel node by navigating to the `node` directory and running the command:

    ```css
    cd node && fuel-core run --ip 127.0.0.1 --port 4000 --chain ./chainConfig.json --db-path ./.fueldb
    ```

    This will start a local node running on your machine.

### Deploying Token and Limit Order Contracts

5. Open new terminal
6.  Navigate to the `contracts/token` directory and create an `.env` file with the following content:

    ```makefile
    echo "SECRET=806e4997e9f54373564eae2da8b28f3f184e91bb0409ec1c9c38740465dceb71" >> .env 
    ```

    This sets the private key of the account used to deploy the contracts.
7.  Build the contracts by running the command:

    ```
    forc build
    ```
8.  Deploy the Token contract by running the command:

    ```arduino
    cargo test --package tests --test tests -- actions::deploy::deploy --exact --nocapture
    ```
9.  Navigate to the `contracts/limit_orders` directory and build the Limit Order contract by running the command:

    ```
    forc build
    ```
10. Deploy the Limit Order contract by running the command:

    ```arduino
    forc deploy --unsigned
    ```

### Running the Frontend

10. Navigate to the `frontend` directory and install the required packages by running the command:

    ```css
    npm i
    ```
11. Start the frontend by running the command:

    ```sql
    npm start
    ```

    This will start the frontend in your default browser.

### Running the Chart Data Feed Backend

12. Open new terminal
13. Unfortunately, we do not yet have instructions on how to launch the backend data feed due to the trading view privacy policy. But you can contact us and we will help you launch a [lightweight trading view chart](https://tradingview.github.io/lightweight-charts/).

### Running the Matcher Service

13. Navigate to the `services/matcher` directory and create an `.env` file with the following content:

    ```makefile
    echo "SECRET=806e4997e9f54373564eae2da8b28f3f184e91bb0409ec1c9c38740465dceb71" >> .env 
    ```

    This sets the private key of the account used to deploy the contracts.
14. Run the Matcher service by running the command:

    ```arduino
    cargo run
    ```

    This will start the Matcher service in your terminal.

That's it! You should now have a local Fuel network running with the Token and Limit Order contracts deployed, the frontend running in your browser, and the Matcher service running in your terminal.

### Testing

To test the frontend, you can connect Alice's or Bob's wallet (which are given at the beginning of this tutorial), they will have ETH on their balance to pay fees&#x20;
