App modules:
- Predicate of order that uses env variables
- Service for orders ( backend )that generates predicate instance for a specific order, builds it, and returns binary and abi files
- frontend app that sends requests to the backend to create predicate and get orders list
Predicted behavior would be this:
1) Alice opens the app and clicks "create order" btn, having filled all the required data like asset price, amount
2) Request is sent to the backend, predicates get to build specially for this order, and artifacts are going back to the frontend
3) Alice sends money to predicate
4) Bob sees Alice's order in the interface ( for now order list comes from backend). Client part creates inputs and outputs for UTXO, and calls predicate ith attached money
5) Predicate transfers money to Alice and Bob like if it was usual transfer
6) Everyone is happy
I have created simple mvp of this approach, repo is here:
If we've done this correctly, it doesn't seem to be a traditional decentralized app approach, that would include an open source code, and implementation of partially fulfilled orders is another task that should be done.
Tx fee would be low though