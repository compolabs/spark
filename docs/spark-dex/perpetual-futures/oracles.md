# Oracles

The protocol incorporates the Pyth Network as its oracle price source, which operates distinctly from traditional oracle systems through a pull price update model.

### **Differences from Traditional Oracles**

* Traditional oracles typically use a push model, where an external, off-chain process consistently feeds price updates onto the blockchain.
* In contrast, the Pyth Network relies on user-initiated actions for these updates. Users are responsible for submitting price updates to the network.

### **Mechanics of Price Updating in Pyth Network**

* The process of updating prices on-chain in the Pyth Network is permissionless. This means any user possessing a verified message can update the Pyth contract with new price information.
* These updates are authenticated through digital signatures, ensuring their validity for on-chain program verification.
* A key feature of this system is that prices can only be updated to reflect more recent information. Submissions of outdated prices are not rejected but don't result in an update of the on-chain price.

### **Implications for Spark Users**

* Due to this model, users of Spark might encounter situations where the price they interact with does not precisely match the price they submitted.
* This characteristic is a result of the pull model of the Pyth Network, where the most recent and verified price updates are the ones reflected on-chain.

This approach ensures that the protocol is fed with timely and authenticated price information, crucial for maintaining accurate and reliable trading operations, albeit with the caveat that users must understand the nuances of this pull model for price updates.
