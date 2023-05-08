---
description: >-
  Service for orders(backend) that generates predicate instance for a specific
  order, builds it and returns binary and abi files
---

# Predicate orders builder service

{% embed url="https://github.com/compolabs/spark/tree/master/services/predicate-orders-builder" %}

### How it works?

1. Alice opens the app and clicks "create order" button, having filled all the required data like asset price, amount
2. Request is sent to the backend, predicates get to build specially for this order, and artifacts are going back to the frontend
3. Alice sends money to predicate
4. Bob sees Alice's order in the interface ( for now order list comes from backend). Client part creates inputs and outputs for UTXO, and calls predicate ith attached money
5. Predicate transfers money to Alice and Bob like if it was usual transfer
6. Everyone is happy I have created simple mvp of this approach, repo is here: If we've done this correctly, it doesn't seem to be a traditional decentralized app approach, that would include an open source code, and implementation of partially fulfilled orders is another task that should be done. Tx fee would be low though

### Testing

1. Clone the repo:

```bash
git clone git@github.com:compolabs/spark.git
```

2. Go to the `predicate-orders-builder` directory:

```bash
cd spark/services/predicate-orders-builder/
```

3. Build the create order script. This command will go into the folder with the script, compile the script to be used to create the predicate order, and exit back:

```bash
cd create_order_script && forc build && cd ../
```

4. Run the predicate orders builder service:

```arduino
cargo run
```

Output:

<figure><img src="../../.gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

5. Open a new terminal window in the `predicate-orders-builder` directory.\

6. Run the test:

```css
cargo test --package predicat-order-builder --test harness -- local_tests::fulfill_order_test::fulfill_order_test --exact --nocapture
```

Output:

<figure><img src="../../.gitbook/assets/image (3).png" alt=""><figcaption></figcaption></figure>

\
