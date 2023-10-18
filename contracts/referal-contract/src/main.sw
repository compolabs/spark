contract;
use std::hash::Hash;

use std::constants::ZERO_B256;

configurable {
    OWNER: Address = Address::from(0x5cd7a90ddc6e4c9ba59c08f9fcd5ec59f1ab9998088a28176f395803c7bd4534),
}

storage {
      admins: StorageMap<Address, bool> = StorageMap {},
      invitations: StorageMap<Address, (u64, u64)> = StorageMap {}, //(invites_left, nasted_invites_amount)
}

struct CheckinEvent{
    address: Address, 
    referal: Address
}
struct AccrueInvitationsEvent{
    address: Address, 
    invites_amount: u64, 
    nasted_max_invites: u64
}

abi ReferalContract { 
    
    // Function for add a new admin
    #[storage(write)]
    fn add_admin(address: Address);   
    
    // Function for removing access from an admin
    #[storage(write)]
    fn remove_admin(address: Address);
    
    #[storage(read, write)]
    fn accrue_invitations(address: Address, invites_amount: u64, nasted_max_invites: u64);

    #[storage(read, write)]
    fn chekin(referal: Address) -> bool;

    #[storage(read)]
    fn verify(address: Address) -> (u64, u64);
}

impl ReferalContract for Contract {
    #[storage(write)]
    fn add_admin(address: Address){
        verify_owner(); 
        storage.admins.insert(address, true);
    }

    #[storage(write)]
    fn remove_admin(address: Address){
        verify_owner(); 
        storage.admins.insert(address, false);
    }

    #[storage(read, write)]
    fn accrue_invitations(address: Address, invites_amount: u64, nasted_max_invites: u64){
        verify_owner_or_admin();
        let (invites_left, _) = storage.invitations.get(address).try_read().unwrap_or((0, 0));
        storage.invitations.insert(address, (invites_left + invites_amount, nasted_max_invites));
        log(AccrueInvitationsEvent{address, invites_amount, nasted_max_invites})
    }
 
    #[storage(read, write)]
    fn chekin(referal_address: Address) -> bool{
        let caller = msg_sender_address();
        let referal = storage.invitations.get(referal_address).try_read();
        if storage.invitations.get(caller).try_read().is_some(){
            true
        } else if referal.is_none(){
            false
        } else {
            let (invites_left, nasted_max_invites)  = referal.unwrap();
            require(invites_left > 0, "Error");
            storage.invitations.insert(referal_address, (invites_left - 1, nasted_max_invites));
            storage.invitations.insert(caller, (nasted_max_invites, nasted_max_invites - 1));
            log(CheckinEvent{referal: referal_address, address: caller});
            true
        }
    }

    #[storage(read)]
    fn verify(address: Address) -> (u64, u64) {
        storage.invitations.get(address).read()
    }
}


pub fn msg_sender_address() -> Address {
    match std::auth::msg_sender().unwrap() {
        Identity::Address(identity) => identity,
        _ => revert(0),
    }
}

// Function to check if the caller is the owner
fn verify_owner() {
    require(OWNER != Address::from(ZERO_B256) && msg_sender_address() == OWNER, "Access denied");
}

// Function to check if the caller is the owner or admin
#[storage(read)]
fn verify_owner_or_admin() {
    let caller = msg_sender_address();
    let is_owner = OWNER != Address::from(ZERO_B256) && caller == OWNER;
    let is_admin = storage.admins.get(caller).try_read().unwrap_or(false);
    require(is_owner || is_admin, "Access denied");
}